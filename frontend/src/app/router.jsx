import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { RoleRoute } from '../components/layout/RoleRoute'
import { ROLES, roleHome } from '../lib/permissions'
import { useSessionStore } from '../stores/sessionStore'
import AdminDashboardPage from '../pages/admin/DashboardPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import LoginPage from '../pages/auth/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProfilePage from '../pages/profile/ProfilePage'
import StudentDashboardPage from '../pages/student/DashboardPage'
import StudentHistoryPage from '../pages/student/HistoryPage'
import StudentSchedulePage from '../pages/student/SchedulePage'
import TeacherDashboardPage from '../pages/teacher/DashboardPage'

function RoleHome() {
  const user = useSessionStore((state) => state.user)
  return <Navigate to={roleHome(user?.role)} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<RoleHome />} />
          <Route path="student" element={<RoleRoute roles={[ROLES.STUDENT]} />}>
            <Route index element={<StudentDashboardPage />} />
            <Route path="schedule" element={<StudentSchedulePage />} />
            <Route path="history" element={<StudentHistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="teacher" element={<RoleRoute roles={[ROLES.TEACHER]} />}>
            <Route index element={<TeacherDashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="admin" element={<RoleRoute roles={[ROLES.ADMIN]} />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}