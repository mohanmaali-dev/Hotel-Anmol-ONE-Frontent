const allowedExtensions = ['xlsx', 'xls', 'csv']
const normalized = (value) => String(value ?? '').trim().toLowerCase()
const loadXlsx = () => import('xlsx')

export function validateImportFile(file) {
  if (!file) return 'Please choose an Excel or CSV file.'
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!allowedExtensions.includes(extension)) return 'Choose a .xlsx, .xls, or .csv file.'
  if (file.size > 10 * 1024 * 1024) return 'The selected file is larger than 10 MB.'
  return ''
}

const validateRows = (typeId, records) => {
  const errors = []
  const validRows = []
  const duplicateKeys = new Set()
  const requireText = (record, column, row) => {
    if (!String(record[column] ?? '').trim()) errors.push({ row, message: `${column} is required.` })
  }
  const requireNumber = (record, column, row, minimum = 0) => {
    const value = Number(record[column])
    if (!Number.isFinite(value) || value < minimum) errors.push({ row, message: `${column} must be ${minimum > 0 ? 'greater than 0' : 'zero or more'}.` })
  }

  records.forEach((record, index) => {
    const row = index + 2
    const before = errors.length
    if (typeId === 'stock-items') {
      ;['Item Name', 'Category', 'Unit'].forEach((column) => requireText(record, column, row))
      ;['Opening Stock', 'Purchase Price', 'Minimum Stock'].forEach((column) => requireNumber(record, column, row))
    } else if (typeId === 'menu-items') {
      ;['Item Name', 'Category', 'Availability', 'Track Stock'].forEach((column) => requireText(record, column, row))
      requireNumber(record, 'Selling Price', row)
      if (!['available', 'unavailable'].includes(normalized(record.Availability))) errors.push({ row, message: 'Availability must be Available or Unavailable.' })
      if (!['yes', 'no', 'true', 'false'].includes(normalized(record['Track Stock']))) errors.push({ row, message: 'Track Stock must be Yes or No.' })
      if (['yes', 'true'].includes(normalized(record['Track Stock']))) errors.push({ row, message: 'Change Track Stock to No for Excel import. Add its ingredients later from Menu Items.' })
    } else if (typeId === 'suppliers') {
      ;['Supplier Name', 'Contact Person', 'Phone', 'Address', 'Status'].forEach((column) => requireText(record, column, row))
      if (!['active', 'inactive'].includes(normalized(record.Status))) errors.push({ row, message: 'Status must be Active or Inactive.' })
    }
    const keyColumn = typeId === 'suppliers' ? 'Phone' : 'Item Name'
    const key = normalized(record[keyColumn])
    if (key && duplicateKeys.has(key)) errors.push({ row, message: `${keyColumn} is duplicated in this file.` })
    duplicateKeys.add(key)
    if (errors.length === before) validRows.push({ ...record, __row: row })
  })
  return { errors, validRows }
}

export async function createFilePreview(file, type) {
  const XLSX = await loadXlsx()
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!worksheet) throw new Error('The selected file does not contain a worksheet.')
  const grid = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false })
    .filter((row) => row.some((value) => String(value).trim()))
  if (!grid.length) throw new Error('The selected file is empty.')
  const columns = grid[0].map((column) => String(column).trim())
  const optionalColumns = new Set(type.optionalColumns || [])
  const missing = type.columns.filter((required) => !optionalColumns.has(required) && !columns.some((column) => normalized(column) === normalized(required)))
  if (missing.length) throw new Error(`Missing required columns: ${missing.join(', ')}`)
  const columnMap = Object.fromEntries(type.columns.map((required) => [required, columns.findIndex((column) => normalized(column) === normalized(required))]))
  const records = grid.slice(1).map((row) => Object.fromEntries(type.columns.map((column) => [column, row[columnMap[column]] ?? ''])))
  const validation = validateRows(type.id, records)
  return {
    columns: type.columns,
    rows: records.slice(0, 5).map((record) => type.columns.map((column) => record[column])),
    totalRows: records.length,
    ...validation,
    note: `Found ${records.length} data row${records.length === 1 ? '' : 's'}; showing up to 5.`,
  }
}

export async function downloadSampleTemplate(type) {
  const XLSX = await loadXlsx()
  const worksheet = XLSX.utils.aoa_to_sheet([type.columns, ...type.sampleRows])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
  XLSX.writeFile(workbook, `${type.id}-sample.xlsx`)
}

export async function writeWorkbook(sheets, filename) {
  const XLSX = await loadXlsx()
  const workbook = XLSX.utils.book_new()
  sheets.forEach(({ name, rows }) => XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), name.slice(0, 31)))
  XLSX.writeFile(workbook, filename)
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
