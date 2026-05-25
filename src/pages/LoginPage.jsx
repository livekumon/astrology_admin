import { useState } from 'react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { DEFAULT_ADMIN_LOGIN, DEFAULT_ADMIN_PASSWORD } from '../constants/adminCredentials'

export default function LoginPage() {
  const { login } = useAdminAuth()
  const [email, setEmail] = useState(DEFAULT_ADMIN_LOGIN)
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">✦ Jyotish Admin</div>
        <p className="login-sub">Sign in to view users, conversations, and token usage.</p>
        <label className="field">
          <span>Login</span>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="error-banner">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
