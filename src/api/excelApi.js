import { getExpenses } from './expenseApi.js'
import { createMenuCategory, createMenuItem, getAllMenuCategories, getMenuItems } from './menuApi.js'
import { getOrders } from './orderApi.js'
import { getPurchases } from './purchaseApi.js'
import { getReport } from './reportsApi.js'
import { getSales } from './salesApi.js'
import { createStockCategory, createStockItem, getStockCategories, getStockItems } from './stockApi.js'
import { createSupplier, getSuppliers } from './supplierApi.js'
import { writeWorkbook } from '../utils/excelHelpers.js'

const lower = (value) => String(value ?? '').trim().toLowerCase()
const number = (value) => Number(value || 0)
const yes = (value) => ['yes', 'true'].includes(lower(value))

const fetchAll = async (getter, params = {}) => {
  const rows = []
  let page = 1
  let pages = 1
  do {
    const result = await getter({ ...params, page, limit: 100 })
    rows.push(...result.data)
    pages = result.pagination?.pages || 1
    page += 1
  } while (page <= pages)
  return rows
}

const fetchCompleteReport = async (type, filters) => {
  const rows = []
  let page = 1
  let pages = 1
  let report
  do {
    report = await getReport(type, { ...filters, page, limit: 100 })
    rows.push(...(report.data || []))
    pages = report.pagination?.pages || 1
    page += 1
  } while (page <= pages)
  return { ...report, data: rows }
}

export const importSpreadsheetRows = async (typeId, rows) => {
  const result = { totalRows: rows.length, imported: 0, skipped: 0, failed: 0, createdCategories: 0, errors: [] }
  let existing = new Set()
  let categories = new Map()

  if (typeId === 'stock-items') {
    existing = new Set((await fetchAll(getStockItems)).map((item) => lower(item.name)))
    categories = new Map((await getStockCategories()).data.map((category) => [lower(category.name), category]))
  }
  if (typeId === 'menu-items') {
    existing = new Set((await fetchAll(getMenuItems)).map((item) => lower(item.name)))
    categories = new Map((await getAllMenuCategories()).map((category) => [lower(category.name), category]))
  }
  if (typeId === 'suppliers') existing = new Set((await fetchAll(getSuppliers)).flatMap((supplier) => [lower(supplier.phone), lower(supplier.email)].filter(Boolean)))

  for (const row of rows) {
    try {
      if (typeId === 'stock-items') {
        const key = lower(row['Item Name'])
        if (existing.has(key)) { result.skipped += 1; result.errors.push({ row: row.__row, message: 'Item already exists.' }); continue }
        const categoryName = String(row.Category || '').trim()
        let category = categories.get(lower(categoryName))
        if (!category) {
          const categoryResult = await createStockCategory({ name: categoryName, isActive: true })
          category = categoryResult.data
          categories.set(lower(categoryName), category)
          result.createdCategories += 1
        } else if (!category.isActive) {
          throw new Error(`Category "${categoryName}" is inactive.`)
        }
        await createStockItem({ name: row['Item Name'], category: row.Category, unit: row.Unit, openingQuantity: number(row['Opening Stock']), purchasePrice: number(row['Purchase Price']), minimumStock: number(row['Minimum Stock']) })
        existing.add(key)
      } else if (typeId === 'menu-items') {
        const key = lower(row['Item Name'])
        if (existing.has(key)) { result.skipped += 1; result.errors.push({ row: row.__row, message: 'Menu item already exists.' }); continue }
        const categoryName = String(row.Category || '').trim()
        let category = categories.get(lower(categoryName))
        if (!category) {
          const categoryResult = await createMenuCategory({ name: categoryName, description: '', isActive: true })
          category = categoryResult.data
          categories.set(lower(categoryName), category)
          result.createdCategories += 1
        } else if (!category.isActive) {
          throw new Error(`Category "${categoryName}" is inactive.`)
        }
        const availability = lower(row.Availability) === 'available' ? 'Available' : 'Unavailable'
        await createMenuItem({ name: row['Item Name'], categoryId: category.id, servingSize: row['Serving Size'], sellingPrice: number(row['Selling Price']), availability, trackStock: yes(row['Track Stock']), ingredients: [] })
        existing.add(key)
      } else if (typeId === 'suppliers') {
        const keys = [lower(row.Phone), lower(row.Email)].filter(Boolean)
        if (keys.some((key) => existing.has(key))) { result.skipped += 1; result.errors.push({ row: row.__row, message: 'Supplier phone or email already exists.' }); continue }
        await createSupplier({ name: row['Supplier Name'], contactPerson: row['Contact Person'], phone: row.Phone, email: row.Email, address: row.Address, status: row.Status })
        keys.forEach((key) => existing.add(key))
      }
      result.imported += 1
    } catch (error) {
      result.failed += 1
      result.errors.push({ row: row.__row, message: error.message })
    }
  }
  return result
}

const dateParams = ({ fromDate, toDate }) => ({ ...(fromDate ? { fromDate } : {}), ...(toDate ? { toDate } : {}) })
const dateText = (value) => value ? new Date(value).toLocaleDateString('en-IN') : ''

const exporters = {
  'menu-items': async () => (await fetchAll(getMenuItems)).map((row) => ({ 'Item Name': row.name, Category: row.category?.name || '', 'Serving Size': row.servingSize || '', 'Selling Price': row.sellingPrice, Availability: row.isAvailable ? 'Available' : 'Unavailable', 'Track Stock': row.trackStock ? 'Yes' : 'No', Recipe: (row.ingredients || []).map((ingredient) => `${ingredient.stockItemName}: ${ingredient.quantityUsed} ${ingredient.unit}`).join(', '), Description: row.description || '' })),
  orders: async (dates) => (await fetchAll(getOrders, dateParams(dates))).map((row) => ({ 'Order No.': row.orderNo, Date: dateText(row.date), 'Order Type': row.orderType, Customer: row.customerName, Area: row.areaRoomNo, Items: (row.items || []).map((item) => `${item.name}${item.servingSize ? ` (${item.servingSize})` : ''} × ${item.quantity}`).join(', '), Subtotal: row.subtotal, Discount: row.discount, 'Additional Charges': row.additionalCharges, 'Final Amount': row.finalAmount, 'Payment Type': row.paymentType, 'Payment Status': row.paymentStatus, Status: row.orderStatus })),
  sales: async (dates) => (await fetchAll(getSales, dateParams(dates))).map((row) => ({ 'Sale No.': row.saleNo, 'Bill No.': row.billNo, 'Order No.': row.orderNo, Date: dateText(row.date), Customer: row.customerName, 'Order Type': row.orderType, 'Final Amount': row.finalAmount, 'Paid Amount': row.paidAmount, 'Due Amount': row.dueAmount, 'Payment Type': row.paymentType, 'Payment Status': row.paymentStatus })),
  purchases: async (dates) => (await fetchAll(getPurchases, dateParams(dates))).map((row) => ({ 'Purchase No.': row.purchaseNo, Date: dateText(row.purchaseDate), Supplier: row.supplierName, 'Invoice No.': row.invoiceNo, Items: (row.items || []).map((item) => `${item.name}: ${item.quantity} ${item.unit}`).join(', '), 'Final Amount': row.finalAmount, 'Paid Amount': row.paidAmount, 'Due Amount': row.dueAmount, 'Payment Type': row.paymentType, 'Payment Status': row.paymentStatus, Status: row.purchaseStatus })),
  stock: async () => (await fetchAll(getStockItems)).map((row) => ({ 'Item Name': row.name, Category: row.category, 'Current Quantity': row.currentQuantity, Unit: row.unit, 'Purchase Price': row.purchasePrice, 'Stock Value': row.stockValue, 'Minimum Stock': row.minimumStock, Status: row.status })),
  expenses: async (dates) => (await fetchAll(getExpenses, dateParams(dates))).map((row) => ({ 'Expense No.': row.expenseNo, Date: dateText(row.date), Category: row.category, Description: row.description, Amount: row.amount, 'Payment Type': row.paymentType, Reference: row.reference })),
  suppliers: async () => (await fetchAll(getSuppliers)).map((row) => ({ 'Supplier Name': row.name, 'Contact Person': row.contactPerson, Phone: row.phone, 'Alternate Phone': row.alternatePhone, Email: row.email, Address: row.address, 'GST / Tax No.': row.gstTaxNo, Status: row.status || (row.isActive ? 'Active' : 'Inactive') })),
}

const summaryRows = (summary = {}) => Object.entries(summary).filter(([, value]) => !Array.isArray(value) && (typeof value !== 'object' || value === null)).map(([key, value]) => ({ Metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()), Value: value }))
const readableReportRows = (rows = []) => rows.map((row) => Object.fromEntries(
  Object.entries(row)
    .filter(([key]) => !['_id', 'id', '__v'].includes(key) && !key.endsWith('Id'))
    .map(([key, value]) => [
      key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()),
      value && typeof value === 'object' ? (value.name || value.itemName || value.supplierName || JSON.stringify(value)) : value,
    ]),
))

export const exportSpreadsheet = async (typeId, dates = {}) => {
  const stamp = new Date().toISOString().slice(0, 10)
  if (typeId === 'reports') {
    const types = ['sales', 'purchases', 'expenses', 'stock', 'payments', 'orders']
    const reports = await Promise.all(types.map((type) => fetchCompleteReport(type, dates)))
    const sheets = []
    reports.forEach((report, index) => {
      const label = types[index].replace(/^./, (letter) => letter.toUpperCase())
      sheets.push({ name: `${label} Summary`, rows: summaryRows(report.summary) })
      if (Array.isArray(report.data) && report.data.length) sheets.push({ name: `${label} Data`, rows: readableReportRows(report.data) })
    })
    if (!sheets.some((sheet) => sheet.rows.length)) throw new Error('No report data is available for this date range.')
    await writeWorkbook(sheets, `restaurant-reports-${stamp}.xlsx`)
    return
  }
  const rows = await exporters[typeId](dates)
  if (!rows.length) throw new Error('No data is available to export for the selected filters.')
  await writeWorkbook([{ name: typeId.replace(/^./, (letter) => letter.toUpperCase()), rows }], `${typeId}-${stamp}.xlsx`)
}
