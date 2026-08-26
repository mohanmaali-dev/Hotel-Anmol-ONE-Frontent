export function validateStockInForm(form) {
  const quantity = Number(form.quantity)
  const purchasePrice = Number(form.purchasePrice)
  if (!form.itemId) return 'Please select a stock item.'
  if (form.quantity === '' || !Number.isFinite(quantity) || quantity <= 0) {
    return 'Please enter a quantity greater than zero.'
  }
  if (form.purchasePrice === '' || !Number.isFinite(purchasePrice) || purchasePrice < 0) {
    return 'Please enter a valid buying price.'
  }
  if (!form.date) return 'Please select the stock date.'
  return ''
}

export function validateStockOutForm(form, item) {
  const quantity = Number(form.quantity)
  const available = Number(item?.currentQuantity || 0)
  if (!form.itemId) return 'Please select a stock item.'
  if (form.quantity === '' || !Number.isFinite(quantity) || quantity <= 0) {
    return 'Please enter a quantity greater than zero.'
  }
  if (quantity > available) return `Only ${available} ${item?.unit || ''} is available.`
  if (!form.date) return 'Please select the stock date.'
  return ''
}
