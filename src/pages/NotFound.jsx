import { FiArrowLeft, FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'

function NotFound() {
  return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12"><div className="max-w-md text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-2xl text-slate-500"><FiSearch /></span><h1 className="mt-5 text-2xl font-bold text-slate-900">Page not found</h1><p className="mt-2 text-sm leading-6 text-slate-500">The page may have moved or the address may be incorrect.</p><Link to="/dashboard" className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiArrowLeft /> Back to Dashboard</Link></div></main>
}

export default NotFound
