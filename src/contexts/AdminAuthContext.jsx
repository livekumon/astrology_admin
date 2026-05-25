import { createContext, useContext, useMemo, useState } from 'react'
import { adminLogin } from '../api/client'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('jyotish_admin_token'))
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem('jyotish_admin_user')
    return raw ? JSON.parse(raw) : null
  })

  async function login(email, password) {
    const result = await adminLogin(email, password)
    localStorage.setItem('jyotish_admin_token', result.token)
    localStorage.setItem('jyotish_admin_user', JSON.stringify(result.admin))
    setToken(result.token)
    setAdmin(result.admin)
  }

  function logout() {
    localStorage.removeItem('jyotish_admin_token')
    localStorage.removeItem('jyotish_admin_user')
    setToken(null)
    setAdmin(null)
  }

  const value = useMemo(
    () => ({ token, admin, login, logout, isAuthenticated: Boolean(token) }),
    [token, admin],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
