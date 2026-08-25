import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'
import { setDefaultCurrency } from '../../utils/orderFormatters.js'

function getPageDetails(pathname) {
  if (pathname === '/excel') {
    return { title: 'Excel Management', subtitle: 'Prepare restaurant data imports and exports' }
  }

  if (pathname === '/settings') {
    return { title: 'Settings', subtitle: 'Manage restaurant defaults and preferences' }
  }

  if (pathname === '/users/new') {
    return { title: 'User', subtitle: 'Create or edit a restaurant user' }
  }

  if (pathname.startsWith('/users/')) {
    return { title: 'User Details', subtitle: 'View account and role permissions' }
  }

  if (pathname === '/users') {
    return { title: 'Users', subtitle: 'Manage restaurant users and roles' }
  }

  if (pathname === '/reports') {
    return { title: 'Reports', subtitle: 'Review restaurant performance and activity' }
  }

  if (pathname === '/expenses/new') {
    return { title: 'Expense', subtitle: 'Create or edit an operating expense' }
  }

  if (pathname.startsWith('/expenses/')) {
    return { title: 'Expense Details', subtitle: 'View expense information' }
  }

  if (pathname === '/expenses') {
    return { title: 'Expenses', subtitle: 'Manage restaurant operating expenses' }
  }

  if (pathname === '/suppliers/new') {
    return { title: 'Supplier', subtitle: 'Create or edit supplier information' }
  }

  if (pathname.startsWith('/suppliers/')) {
    return { title: 'Supplier Details', subtitle: 'View supplier purchases and balances' }
  }

  if (pathname === '/suppliers') {
    return { title: 'Suppliers', subtitle: 'Manage restaurant suppliers' }
  }

  if (pathname === '/menu/categories') {
    return { title: 'Menu Categories', subtitle: 'Manage restaurant menu categories' }
  }

  if (pathname === '/menu/items/new') {
    return { title: 'Menu Item', subtitle: 'Create or edit a menu item' }
  }

  if (pathname.startsWith('/menu/items/')) {
    return { title: 'Menu Item Details', subtitle: 'View item and recipe information' }
  }

  if (pathname === '/menu/items') {
    return { title: 'Menu Items', subtitle: 'Manage menu pricing and availability' }
  }

  if (pathname === '/menu') {
    return { title: 'Menu', subtitle: 'Manage restaurant categories and items' }
  }

  if (pathname === '/stock/items') {
    return { title: 'Stock Items', subtitle: 'Add or edit inventory items' }
  }

  if (pathname === '/stock/history') {
    return { title: 'Stock History', subtitle: 'Review every inventory movement' }
  }

  if (pathname === '/stock') {
    return { title: 'Stock', subtitle: 'Manage restaurant inventory' }
  }

  if (pathname === '/purchases/new') {
    return { title: 'New Purchase', subtitle: 'Create or update a supplier purchase' }
  }

  if (pathname.startsWith('/purchases/')) {
    return { title: 'Purchase Details', subtitle: 'View purchase and payment information' }
  }

  if (pathname === '/purchases') {
    return { title: 'Purchases', subtitle: 'Manage supplier purchases and payments' }
  }

  if (pathname.startsWith('/sales/')) {
    return { title: 'Sale Details', subtitle: 'View complete sale information' }
  }

  if (pathname === '/sales') {
    return { title: 'Sales', subtitle: 'Track restaurant sales and collections' }
  }

  if (pathname.startsWith('/billing/')) {
    return { title: 'Billing Details', subtitle: 'Review bill and payment information' }
  }

  if (pathname === '/billing') {
    return { title: 'Billing', subtitle: 'Manage restaurant bills and payments' }
  }

  if (pathname === '/orders/new') {
    return { title: 'New Order', subtitle: 'Create a new restaurant order' }
  }

  if (pathname.startsWith('/orders/')) {
    return { title: 'Order Details', subtitle: 'View complete order information' }
  }

  return { title: 'Orders', subtitle: 'Manage all restaurant orders' }
}

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const page = getPageDetails(pathname)
  const { settings } = useSettings()
  setDefaultCurrency(settings.restaurant.currency)

  return (
    <div className="min-h-screen bg-cream text-slate-800">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="print-shell lg:pl-64">
        <Navbar
          title={page.title}
          subtitle={page.subtitle}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <Outlet />
      </div>
    </div>
  )
}

export default AppLayout
