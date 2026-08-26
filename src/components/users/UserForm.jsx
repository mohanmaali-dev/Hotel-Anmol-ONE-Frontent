import { useState } from 'react'
import { FiAlertCircle, FiSave, FiShield, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { getRolePermissions, userRoles } from '../../data/permissionOptions.js'
import RolePermissions from './RolePermissions.jsx'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

function UserForm({ initialUser, onSave, saving = false, apiError = '', onClearError }) {
  const [form, setForm] = useState({
    fullName: initialUser?.fullName || '', username: initialUser?.username || '', email: initialUser?.email || '',
    phone: String(initialUser?.phone || '').replace(/\D/g, ''), role: initialUser?.role || 'Staff', password: '', confirmPassword: '',
    isActive: initialUser?.isActive ?? true, permissions: initialUser?.permissions || getRolePermissions('Staff'),
  })
  const [error, setError] = useState('')

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const updateRole = (role) => setForm((current) => ({ ...current, role, permissions: getRolePermissions(role) }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.fullName.trim() || !form.username.trim() || !form.phone.trim() || !form.role) {
      setError('Please enter the full name, username, phone, and role.')
      return
    }
    if (!initialUser && form.password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }
    if (initialUser && form.password && form.password.length < 8) {
      setError('The new password must contain at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Password and Confirm Password do not match.')
      return
    }
    setError('')
    await onSave({ ...initialUser, ...form })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || apiError) && <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"><FiAlertCircle className="mt-0.5 shrink-0" /><span className="flex-1">{error || apiError}</span><button type="button" onClick={() => { setError(''); onClearError?.() }} aria-label="Close error message" className="grid size-6 place-items-center rounded-md hover:bg-rose-100"><FiX /></button></div>}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
        <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiShield /></span><div><h2 className="font-bold text-slate-900">User Information</h2><p className="text-xs text-slate-500">Account, contact, role, and status</p></div></div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</span><input type="text" value={form.fullName} onChange={(event) => updateForm('fullName', event.target.value)} placeholder="Enter full name" className={inputClass} /></label>
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Username</span><input type="text" value={form.username} onChange={(event) => updateForm('username', event.target.value)} placeholder="Enter username" autoComplete="off" className={inputClass} /></label>
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Email <span className="font-normal text-slate-400">(optional)</span></span><input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} placeholder="user@example.com" className={inputClass} /></label>
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</span><input type="tel" inputMode="numeric" pattern="[0-9]{7,15}" maxLength="15" value={form.phone} onChange={(event) => updateForm('phone', event.target.value.replace(/\D/g, ''))} placeholder="Enter phone number" className={inputClass} /></label>
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Role</span><select value={form.role} onChange={(event) => updateRole(event.target.value)} className={inputClass}>{userRoles.map((role) => <option key={role}>{role}</option>)}</select><span className="mt-1 block text-xs text-slate-400">Changing the role updates the usual access for that role.</span></label>
          <fieldset><legend className="mb-1.5 text-sm font-semibold text-slate-700">Status</legend><div className="grid grid-cols-2 gap-2">{[true, false].map((value) => <button key={String(value)} type="button" onClick={() => updateForm('isActive', value)} className={`h-10 rounded-lg border text-sm font-semibold ${form.isActive === value ? 'border-primary bg-primary-light text-primary-dark' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{value ? 'Active' : 'Inactive'}</button>)}</div></fieldset>
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Password {initialUser && <span className="font-normal text-slate-400">(leave blank to keep)</span>}</span><input type="password" value={form.password} onChange={(event) => updateForm('password', event.target.value)} placeholder={initialUser ? 'Enter only to change' : 'Minimum 8 characters'} autoComplete="new-password" className={inputClass} /></label>
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm Password</span><input type="password" value={form.confirmPassword} onChange={(event) => updateForm('confirmPassword', event.target.value)} placeholder="Re-enter password" autoComplete="new-password" className={inputClass} /></label>
        </div>
      </section>

      <RolePermissions permissions={form.permissions} onChange={(permissions) => updateForm('permissions', permissions)} />

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end"><Link to={initialUser ? `/users/${initialUser.id}` : '/users'} className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</Link><button type="submit" disabled={saving} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"><FiSave /> {saving ? 'Saving...' : initialUser ? 'Update User' : 'Save User'}</button></div>
    </form>
  )
}

export default UserForm
