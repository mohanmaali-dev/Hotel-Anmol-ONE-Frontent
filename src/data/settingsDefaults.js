export const defaultSettings = {
  restaurant: {
    name: 'Restaurant',
    phone: '',
    email: '',
    address: '',
    gstTaxNumber: '',
    currency: 'INR',
    logoName: '',
  },
  billing: {
    billPrefix: 'BILL',
    taxPercentage: 0,
    defaultAdditionalCharge: 0,
    allowDiscount: true,
    footerMessage: 'Thank you for dining with us!',
  },
  order: {
    defaultOrderType: 'Dine In',
    autoGenerateOrderNumber: true,
    autoGenerateBillNumber: true,
  },
  stock: {
    lowStockAlertEnabled: true,
    defaultMinimumStock: 5,
  },
}

export const mergeSettings = (settings = {}) => ({
  restaurant: { ...defaultSettings.restaurant, ...settings.restaurant },
  billing: { ...defaultSettings.billing, ...settings.billing },
  order: { ...defaultSettings.order, ...settings.order },
  stock: { ...defaultSettings.stock, ...settings.stock },
})
