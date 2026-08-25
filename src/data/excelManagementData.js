export const importTypes = [
  {
    id: 'menu-items', module: 'menu', title: 'Import Menu Items', description: 'Add menu names, serving sizes, categories, prices, and availability.',
    columns: ['Item Name', 'Category', 'Serving Size', 'Selling Price', 'Availability', 'Track Stock'],
    optionalColumns: ['Serving Size'],
    sampleRows: [['Paneer Tikka', 'Starter', '1 Plate (8 Pieces)', '280', 'Available', 'No'], ['Fresh Lime Soda', 'Drinks', '250 ml', '110', 'Available', 'No']],
  },
  {
    id: 'stock-items', module: 'stock', title: 'Import Stock Items', description: 'Add ingredients, opening quantity, price, and minimum stock.',
    columns: ['Item Name', 'Category', 'Unit', 'Opening Stock', 'Purchase Price', 'Minimum Stock'],
    sampleRows: [['Basmati Rice', 'Grains & Flour', 'kg', '20', '120', '10'], ['Cooking Oil', 'Oil & Dairy', 'litre', '8', '145', '10']],
  },
  {
    id: 'suppliers', module: 'suppliers', title: 'Import Suppliers', description: 'Add supplier contact and business information.',
    columns: ['Supplier Name', 'Contact Person', 'Phone', 'Email', 'Address', 'Status'],
    sampleRows: [['Fresh Farm Foods', 'Rakesh Kumar', '9876543210', 'orders@example.com', 'Jaipur', 'Active']],
  },
  {
    id: 'orders-sales', module: 'orders', title: 'Import Existing Orders / Sales', description: 'Historical imports are disabled to protect generated bills, sales, and stock records.', disabled: true,
    columns: ['Order No.', 'Date', 'Customer', 'Order Type', 'Final Amount', 'Payment Type', 'Payment Status'],
    sampleRows: [['ORD-1001', '2026-08-01', 'Rohan Mehta', 'Dine In', '1240', 'UPI', 'Paid']],
  },
]

export const exportTypes = [
  { id: 'menu-items', module: 'menu', title: 'Export Menu Items', description: 'Menu items, serving sizes, prices, and availability.', usesDates: false },
  { id: 'orders', module: 'orders', title: 'Export Orders', description: 'Order details and payment status.', usesDates: true },
  { id: 'sales', module: 'sales', title: 'Export Sales', description: 'Sales, paid amounts, and due amounts.', usesDates: true },
  { id: 'purchases', module: 'purchases', title: 'Export Purchases', description: 'Supplier purchases and payment balances.', usesDates: true },
  { id: 'stock', module: 'stock', title: 'Export Stock', description: 'Current quantities, values, and stock status.', usesDates: false },
  { id: 'expenses', module: 'expenses', title: 'Export Expenses', description: 'Operating expenses by date and category.', usesDates: true },
  { id: 'suppliers', module: 'suppliers', title: 'Export Suppliers', description: 'Supplier contact and business information.', usesDates: false },
  { id: 'reports', module: 'reports', title: 'Export Reports', description: 'Combined restaurant report information.', usesDates: true },
]
