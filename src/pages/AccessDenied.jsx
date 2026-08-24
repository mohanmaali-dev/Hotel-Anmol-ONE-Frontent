import { FiArrowLeft, FiLock } from 'react-icons/fi'
import { Link } from 'react-router-dom'

function AccessDenied() {
  return (
    <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-2xl text-rose-600"><FiLock /></span>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Access Denied</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Your account does not have permission to open this page. Ask an administrator if you need access.</p>
        <Link to="/dashboard" className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiArrowLeft /> Back to Dashboard</Link>
      </div>
    </main>
  )
}

export default AccessDenied
