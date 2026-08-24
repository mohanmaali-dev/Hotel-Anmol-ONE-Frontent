export const userRoles = ['Admin', 'Manager', 'Cashier', 'Waiter', 'Staff']
export const permissionActions = ['view', 'create', 'edit', 'delete']
export const permissionModules = [
  'dashboard', 'orders', 'billing', 'sales', 'purchases', 'stock', 'menu',
  'suppliers', 'expenses', 'reports', 'users', 'settings',
]

const fullAccess = () => Object.fromEntries(permissionActions.map((action) => [action, true]))
const moduleAccess = (...actions) => Object.fromEntries(
  permissionActions.map((action) => [action, actions.includes(action)]),
)

const roleDefaults = {
  Admin: Object.fromEntries(permissionModules.map((module) => [module, fullAccess()])),
  Manager: Object.fromEntries(permissionModules.map((module) => [
    module,
    module === 'users' ? moduleAccess('view')
      : module === 'settings' ? moduleAccess('view', 'edit') : fullAccess(),
  ])),
  Cashier: {
    dashboard: moduleAccess('view'), orders: moduleAccess('view', 'create', 'edit'),
    billing: moduleAccess('view', 'create', 'edit'), sales: moduleAccess('view'),
    stock: moduleAccess('view'), menu: moduleAccess('view'), reports: moduleAccess('view'),
  },
  Waiter: {
    dashboard: moduleAccess('view'), orders: moduleAccess('view', 'create', 'edit'),
    billing: moduleAccess('view'), stock: moduleAccess('view'), menu: moduleAccess('view'),
  },
  Staff: {
    dashboard: moduleAccess('view'), orders: moduleAccess('view'),
    stock: moduleAccess('view', 'edit'), menu: moduleAccess('view'),
    expenses: moduleAccess('view', 'create'),
  },
}

const emptyPermissions = () => Object.fromEntries(
  permissionModules.map((module) => [module, moduleAccess()]),
)

export const getRolePermissions = (role) => {
  const permissions = emptyPermissions()
  Object.entries(roleDefaults[role] || {}).forEach(([module, actions]) => {
    permissions[module] = { ...actions }
  })
  return permissions
}

export const permissionsArrayToMap = (permissions = []) => {
  const mapped = emptyPermissions()
  permissions.forEach(({ module, actions = [] }) => {
    const key = String(module).toLowerCase()
    if (mapped[key]) mapped[key] = moduleAccess(...actions.map((action) => action.toLowerCase()))
  })
  return mapped
}

export const permissionsMapToArray = (permissions = {}) => permissionModules
  .map((module) => ({
    module,
    actions: permissionActions.filter((action) => permissions[module]?.[action]),
  }))
  .filter((permission) => permission.actions.length)
