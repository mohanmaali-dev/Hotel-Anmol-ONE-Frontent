import { Outlet } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import AccessDenied from '../pages/AccessDenied.jsx'

function PermissionRoute({ module, action = 'view' }) {
  const { can } = useAuth()
  if (!can(module, action)) return <AccessDenied />
  return <Outlet />
}

export default PermissionRoute
