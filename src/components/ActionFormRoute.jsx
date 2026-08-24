import { Outlet, useSearchParams } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import AccessDenied from '../pages/AccessDenied.jsx'

function ActionFormRoute({ module }) {
  const { can } = useAuth()
  const [searchParams] = useSearchParams()
  const action = searchParams.has('edit') ? 'edit' : 'create'
  return can(module, action) ? <Outlet /> : <AccessDenied />
}

export default ActionFormRoute
