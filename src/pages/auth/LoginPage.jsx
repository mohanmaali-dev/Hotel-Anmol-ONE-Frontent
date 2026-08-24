import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import AuthField from '../../components/AuthField.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(form)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div>
      <img
        src="/logo.svg"
        alt="DineDesk Restaurant Manager"
        className="mb-8 h-14 w-auto max-w-full"
      />
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-slate-500">Sign in to continue to your account.</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <AuthField
          label="Username or Email"
          type="text"
          value={form.usernameOrEmail}
          onChange={(event) => setForm({ ...form, usernameOrEmail: event.target.value })}
          placeholder="Enter username or email"
          autoComplete="username"
          required
        />
        <AuthField
          label="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Close login error" className="grid size-6 place-items-center rounded-md hover:bg-red-100">
              <FiX />
            </button>
          </div>
        )}

        <button
          className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">Use the account provided by your restaurant administrator.</p>
    </div>
  )
}

export default LoginPage
