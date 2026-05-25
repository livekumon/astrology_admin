import { useAdminAuth } from './contexts/AdminAuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const { isAuthenticated } = useAdminAuth()
  return isAuthenticated ? <DashboardPage /> : <LoginPage />
}
