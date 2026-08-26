import { unitOptions } from './units.js'

const allowedExtensions = ['xlsx', 'xls', 'csv']
const normalized = (value) => String(value ?? '').trim().toLowerCase()
const stockUnits = new Set(unitOptions)
const loadExcel = () => import('exceljs').then((module) => module.default || module)
const loadLegacyExcel = () => import('xlsx').then((module) => module.default || module)

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
      if (!stockUnits.has(normalized(record.Unit))) errors.push({ row, message: `Unit must be one of: ${unitOptions.join(', ')}.` })
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
  const extension = file.name.split('.').pop()?.toLowerCase()
  let grid
  if (extension === 'csv') {
    grid = parseCsv(await file.text())
  } else if (extension === 'xls') {
    const XLSX = await loadLegacyExcel()
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    grid = worksheet
      ? XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false })
      : []
  } else {
    const ExcelJS = await loadExcel()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(await file.arrayBuffer())
    const worksheet = workbook.worksheets[0]
    grid = []
    worksheet?.eachRow({ includeEmpty: false }, (row) => {
      grid.push(row.values.slice(1).map(cellText))
    })
  }
  const worksheet = grid?.length
  if (!worksheet) throw new Error('The selected file does not contain a worksheet.')
  grid = grid.filter((row) => row.some((value) => String(value).trim()))
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
  await writeWorkbook(
    [{ name: 'Template', rows: type.sampleRows.map((row) => Object.fromEntries(type.columns.map((column, index) => [column, row[index] ?? '']))) }],
    `${type.id}-sample.xlsx`,
  )
}

export async function writeWorkbook(sheets, filename) {
  const ExcelJS = await loadExcel()
  const workbook = new ExcelJS.Workbook()
  sheets.forEach(({ name, rows }) => {
    const worksheet = workbook.addWorksheet(name.slice(0, 31))
    const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))]
    worksheet.columns = columns.map((column) => ({ header: column, key: column, width: Math.min(Math.max(column.length + 2, 14), 35) }))
    rows.forEach((row) => worksheet.addRow(row))
    worksheet.getRow(1).font = { bold: true }
    worksheet.views = [{ state: 'frozen', ySplit: 1 }]
  })
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function cellText(value) {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'object') {
    if (Array.isArray(value.richText)) return value.richText.map((part) => part.text).join('')
    if (value.result !== undefined) return value.result
    if (value.text !== undefined) return value.text
  }
  return String(value)
}

function parseCsv(text) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (character === '"' && quoted && text[index + 1] === '"') { value += '"'; index += 1 }
    else if (character === '"') quoted = !quoted
    else if (character === ',' && !quoted) { row.push(value); value = '' }
    else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(value); rows.push(row); row = []; value = ''
    } else value += character
  }
  if (value || row.length) { row.push(value); rows.push(row) }
  return rows
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
