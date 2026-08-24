import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AuthLayout from './components/AuthLayout.jsx'
import ActionFormRoute from './components/ActionFormRoute.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PermissionRoute from './components/PermissionRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ExcelManagement from './pages/ExcelManagement.jsx'
import NotFound from './pages/NotFound.jsx'
import Settings from './pages/Settings.jsx'
import Billing from './pages/billing/Billing.jsx'
import BillingDetails from './pages/billing/BillingDetails.jsx'
import ExpenseDetails from './pages/expenses/ExpenseDetails.jsx'
import Expenses from './pages/expenses/Expenses.jsx'
import NewExpense from './pages/expenses/NewExpense.jsx'
import Categories from './pages/menu/Categories.jsx'
import Menu from './pages/menu/Menu.jsx'
import MenuItemDetails from './pages/menu/MenuItemDetails.jsx'
import MenuItems from './pages/menu/MenuItems.jsx'
import NewMenuItem from './pages/menu/NewMenuItem.jsx'
import NewOrder from './pages/orders/NewOrder.jsx'
import OrderDetails from './pages/orders/OrderDetails.jsx'
import Orders from './pages/orders/Orders.jsx'
import NewPurchase from './pages/purchases/NewPurchase.jsx'
import PurchaseDetails from './pages/purchases/PurchaseDetails.jsx'
import Purchases from './pages/purchases/Purchases.jsx'
import Reports from './pages/reports/Reports.jsx'
import SaleDetails from './pages/sales/SaleDetails.jsx'
import Sales from './pages/sales/Sales.jsx'
import Stock from './pages/stock/Stock.jsx'
import StockHistory from './pages/stock/StockHistory.jsx'
import StockItems from './pages/stock/StockItems.jsx'
import NewSupplier from './pages/suppliers/NewSupplier.jsx'
import SupplierDetails from './pages/suppliers/SupplierDetails.jsx'
import Suppliers from './pages/suppliers/Suppliers.jsx'
import NewUser from './pages/users/NewUser.jsx'
import UserDetails from './pages/users/UserDetails.jsx'
import Users from './pages/users/Users.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider><Routes>
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
        </Routes></SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
