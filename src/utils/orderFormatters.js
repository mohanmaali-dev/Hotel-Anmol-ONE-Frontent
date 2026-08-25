let defaultCurrency = 'INR'

export const setDefaultCurrency = (currency) => {
  defaultCurrency = currency || 'INR'
}

export const getCurrencySymbol = (currency = defaultCurrency) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency })
    .formatToParts(0)
    .find((part) => part.type === 'currency')?.value || currency

export const formatCurrency = (value, currency = defaultCurrency) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

export const formatOrderDate = (value, includeTime = false) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date)
}
