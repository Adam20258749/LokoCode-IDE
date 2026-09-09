import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/auth'
import { useTheme } from './store/theme'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import IDEPage from './pages/IDEPage'
import SettingsPage from './pages/SettingsPage'
import BillingPage from './pages/BillingPage'
import VMsPage from './pages/VMsPage'
import CommandPalette from './components/CommandPalette'

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center bg-app text-2">Loading…</div>
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  const init = useAuth(s => s.init)
  const theme = useTheme(s => s.theme)
  const user = useAuth(s => s.user)

  useEffect(() => { init() }, [init])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        if (user) {
          const event = new CustomEvent('lokocode:command-palette')
          window.dispatchEvent(event)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [user])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/ide/:projectId" element={<Protected><IDEPage /></Protected>} />
        <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
        <Route path="/billing" element={<Protected><BillingPage /></Protected>} />
        <Route path="/vms" element={<Protected><VMsPage /></Protected>} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth"} replace />} />
      </Routes>
      <CommandPalette />
    </BrowserRouter>
  )
}
