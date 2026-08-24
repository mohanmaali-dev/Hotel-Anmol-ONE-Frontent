import { useEffect, useState } from 'react'
import { FiArrowLeft, FiUsers } from 'react-icons/fi'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { createUser, getUser, updateUser } from '../../api/userApi.js'
import UserForm from '../../components/users/UserForm.jsx'

function NewUser() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const [initialUser, setInitialUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(editId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editId) return
    getUser(editId).then((result) => setInitialUser(result.data)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [editId])

  const handleSave = async (user) => {
    if (saving) return
    setSaving(true); setError('')
    try {
      const result = editId ? await updateUser(editId, user) : await createUser(user)
      navigate(`/users/${result.data.id}`, { state: { message: editId ? 'User updated successfully.' : 'User added successfully.' } })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /></main>
  if (editId && !initialUser) return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12"><div className="text-center"><FiUsers className="mx-auto text-3xl text-slate-400" /><h2 className="mt-4 text-xl font-bold text-slate-900">User not found</h2><p className="mt-2 text-sm text-rose-600">{error}</p><Link to="/users" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white"><FiArrowLeft /> Back to Users</Link></div></main>

  return <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content"><div className="mb-6"><Link to={initialUser ? `/users/${initialUser.id}` : '/users'} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Users</Link><h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{initialUser ? 'Edit User' : 'Add User'}</h2><p className="mt-1 text-sm text-slate-500">Enter account details and choose what this person can access.</p></div><UserForm initialUser={initialUser} onSave={handleSave} saving={saving} apiError={error} onClearError={() => setError('')} /></div></main>
}

export default NewUser
