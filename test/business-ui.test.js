import assert from 'node:assert/strict'
import test from 'node:test'

import { formatFileSize, validateImportFile } from '../src/utils/excelHelpers.js'
import { formatCurrency, setDefaultCurrency } from '../src/utils/orderFormatters.js'
import { convertedQuantity, standardConversionFactor } from '../src/utils/units.js'

test('recipe units convert to the stock unit', () => {
  assert.equal(standardConversionFactor('gram', 'kg'), 0.001)
  assert.equal(convertedQuantity({ unit: 'kg' }, 250, 'gram'), 0.25)
  assert.equal(convertedQuantity({ unit: 'litre' }, 500, 'ml'), 0.5)
  assert.equal(convertedQuantity({ unit: 'piece' }, 1, 'gram'), null)
})

test('currency formatting follows restaurant settings', () => {
  setDefaultCurrency('USD')
  assert.match(formatCurrency(125.5), /\$/)
  setDefaultCurrency('INR')
  assert.match(formatCurrency(125.5), /₹/)
})

test('Excel import accepts only safe supported files', () => {
  assert.equal(validateImportFile({ name: 'menu.xlsx', size: 1000 }), '')
  assert.equal(validateImportFile({ name: 'stock.csv', size: 1000 }), '')
  assert.match(validateImportFile({ name: 'legacy.xls', size: 1000 }), /\.xlsx or \.csv/)
  assert.match(validateImportFile({ name: 'large.xlsx', size: 11 * 1024 * 1024 }), /10 MB/)
  assert.equal(formatFileSize(1024), '1.0 KB')
})
