import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AuthLayout from './components/AuthLayout.jsx'
import ActionFormRoute from './components/ActionFormRoute.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PermissionRoute from './components/PermissionRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const ExcelManagement = lazy(() => import('./pages/ExcelManagement.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Billing = lazy(() => import('./pages/billing/Billing.jsx'))
const BillingDetails = lazy(() => import('./pages/billing/BillingDetails.jsx'))
const ExpenseDetails = lazy(() => import('./pages/expenses/ExpenseDetails.jsx'))
const Expenses = lazy(() => import('./pages/expenses/Expenses.jsx'))
const NewExpense = lazy(() => import('./pages/expenses/NewExpense.jsx'))
const Categories = lazy(() => import('./pages/menu/Categories.jsx'))
const Menu = lazy(() => import('./pages/menu/Menu.jsx'))
const MenuItemDetails = lazy(() => import('./pages/menu/MenuItemDetails.jsx'))
const MenuItems = lazy(() => import('./pages/menu/MenuItems.jsx'))
const NewMenuItem = lazy(() => import('./pages/menu/NewMenuItem.jsx'))
const NewOrder = lazy(() => import('./pages/orders/NewOrder.jsx'))
const OrderDetails = lazy(() => import('./pages/orders/OrderDetails.jsx'))
const Orders = lazy(() => import('./pages/orders/Orders.jsx'))
const NewPurchase = lazy(() => import('./pages/purchases/NewPurchase.jsx'))
const PurchaseDetails = lazy(() => import('./pages/purchases/PurchaseDetails.jsx'))
const Purchases = lazy(() => import('./pages/purchases/Purchases.jsx'))
const Reports = lazy(() => import('./pages/reports/Reports.jsx'))
const SaleDetails = lazy(() => import('./pages/sales/SaleDetails.jsx'))
const Sales = lazy(() => import('./pages/sales/Sales.jsx'))
const Stock = lazy(() => import('./pages/stock/Stock.jsx'))
const StockHistory = lazy(() => import('./pages/stock/StockHistory.jsx'))
const StockItems = lazy(() => import('./pages/stock/StockItems.jsx'))
const NewSupplier = lazy(() => import('./pages/suppliers/NewSupplier.jsx'))
const SupplierDetails = lazy(() => import('./pages/suppliers/SupplierDetails.jsx'))
const Suppliers = lazy(() => import('./pages/suppliers/Suppliers.jsx'))
const NewUser = lazy(() => import('./pages/users/NewUser.jsx'))
const UserDetails = lazy(() => import('./pages/users/UserDetails.jsx'))
const Users = lazy(() => import('./pages/users/Users.jsx'))

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider><Suspense fallback={<div className="grid min-h-screen place-items-center bg-cream"><span className="size-10 animate-spin rounded-full border-4 border-primary-light border-t-primary" /></div>}><Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<PermissionRoute module="dashboard" />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route element={<AppLayout />}>
              <Route element={<PermissionRoute module="orders" />}><Route path="/orders" element={<Orders />} /><Route path="/orders/:id" element={<OrderDetails />} /></Route>
              <Route element={<PermissionRoute module="orders" action="create" />}><Route path="/orders/new" element={<NewOrder />} /></Route>
              <Route element={<PermissionRoute module="billing" />}><Route path="/billing" element={<Billing />} /><Route path="/billing/:id" element={<BillingDetails />} /></Route>
              <Route element={<PermissionRoute module="sales" />}><Route path="/sales" element={<Sales />} /><Route path="/sales/:id" element={<SaleDetails />} /></Route>
              <Route element={<PermissionRoute module="purchases" />}><Route path="/purchases" element={<Purchases />} /><Route path="/purchases/:id" element={<PurchaseDetails />} /></Route>
              <Route element={<ActionFormRoute module="purchases" />}><Route path="/purchases/new" element={<NewPurchase />} /></Route>
              <Route element={<PermissionRoute module="stock" />}><Route path="/stock" element={<Stock />} /><Route path="/stock/history" element={<StockHistory />} /></Route>
              <Route element={<ActionFormRoute module="stock" />}><Route path="/stock/items" element={<StockItems />} /></Route>
              <Route element={<PermissionRoute module="menu" />}><Route path="/menu" element={<Menu />} /><Route path="/menu/categories" element={<Categories />} /><Route path="/menu/items" element={<MenuItems />} /><Route path="/menu/items/:id" element={<MenuItemDetails />} /></Route>
              <Route element={<ActionFormRoute module="menu" />}><Route path="/menu/items/new" element={<NewMenuItem />} /></Route>
              <Route element={<PermissionRoute module="suppliers" />}><Route path="/suppliers" element={<Suppliers />} /><Route path="/suppliers/:id" element={<SupplierDetails />} /></Route>
              <Route element={<ActionFormRoute module="suppliers" />}><Route path="/suppliers/new" element={<NewSupplier />} /></Route>
              <Route element={<PermissionRoute module="expenses" />}><Route path="/expenses" element={<Expenses />} /><Route path="/expenses/:id" element={<ExpenseDetails />} /></Route>
              <Route element={<ActionFormRoute module="expenses" />}><Route path="/expenses/new" element={<NewExpense />} /></Route>
              <Route element={<PermissionRoute module="reports" />}><Route path="/reports" element={<Reports />} /></Route>
              <Route element={<PermissionRoute module="users" />}><Route path="/users" element={<Users />} /><Route path="/users/:id" element={<UserDetails />} /></Route>
              <Route element={<ActionFormRoute module="users" />}><Route path="/users/new" element={<NewUser />} /></Route>
              <Route element={<PermissionRoute module="settings" />}><Route path="/settings" element={<Settings />} /><Route path="/excel" element={<ExcelManagement />} /></Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes></Suspense></SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
