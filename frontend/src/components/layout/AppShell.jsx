import { LogOut } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthLogout } from '../../hooks/useAuth'
import { roleLabel } from '../../lib/permissions'
import { useSessionStore } from '../../stores/sessionStore'
import { PageLoader } from '../feedback/PageLoader'

export function AppShell() {
  const user = useSessionStore((state) => state.user)
  const navigate = useNavigate()
  const logout = useAuthLogout()

  const handleLogout = async () => {
    try {
      await logout.mutateAsync()
    } catch {
      navigate('/login', { replace: true })
    }
  }

  if (logout.isPending) return <PageLoader label="Keluar…" />

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-school-blue-900 text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <span className="text-sm font-semibold">Kak Lia</span>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {user?.name} · {roleLabel(user?.role)}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-radius-sm px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Keluar
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}