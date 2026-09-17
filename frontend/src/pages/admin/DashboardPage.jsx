import { BarChart3, GraduationCap, Network, School, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '../../components/common/Skeleton'
import { getErrorMessage, isNetworkError } from '../../lib/errorMapping'
import { useSessionStore } from '../../stores/sessionStore'
import { useMemberships } from '../../features/admin/hooks/usePlotting'
import { useClasses } from '../../features/admin/hooks/useAcademicMasters'
import { useAdminUsers } from '../../features/admin/hooks/useAdminUsers'
import { useTeacherSessions } from '../../features/teacher/hooks/useTeacherSessions'

const QUICK_LINKS = [
  { to: '/app/admin/banners', label: 'Banner sekolah', description: 'Atur banner yang tampil di beranda.', icon: GraduationCap },
  { to: '/app/admin/users', label: 'Pengguna', description: 'Kelola akun dan reset password.', icon: Users },
  { to: '/app/admin/academic', label: 'Akademik', description: 'Jenjang, kelas, dan mata pelajaran.', icon: School },
  { to: '/app/admin/plotting', label: 'Penempatan', description: 'Siswa pada kelas dan guru.', icon: Network },
  { to: '/app/admin/reports', label: 'Laporan kehadiran', description: 'Rekap global dan export.', icon: BarChart3 },
]

function SummaryCard({ label, value, loading, error }) {
  return (
    <div className="rounded-radius-md border border-line-200 bg-surface-0 p-5 shadow-1">
      <p className="text-caption uppercase tracking-wide text-ink-500">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : error ? (
        <p className="mt-2 text-data text-danger-700">—</p>
      ) : (
        <p className="mt-2 text-heading-lg font-bold text-ink-900">{value}</p>
      )}
    </div>
  )
}

// ringkasan berasal dari meta.total endpoint list yang ada — tanpa endpoint
// analitik baru di luar PRD (docs/DECISIONS.md D14).
export default function AdminDashboardPage() {
  const user = useSessionStore((state) => state.user)
  const usersQuery = useAdminUsers({ page: 1, limit: 1 })
  const classesQuery = useClasses({ page: 1, limit: 1 })
  const membershipsQuery = useMemberships({ page: 1, limit: 1 })
  const sessionsQuery = useTeacherSessions()
  const anyNetworkError = [usersQuery, classesQuery, membershipsQuery, sessionsQuery].some(
    (query) => isNetworkError(query.error),
  )

  const counts = [
    { label: 'Pengguna', value: usersQuery.data?.meta?.total, query: usersQuery },
    { label: 'Kelas', value: classesQuery.data?.meta?.total, query: classesQuery },
    { label: 'Penempatan siswa', value: membershipsQuery.data?.meta?.total, query: membershipsQuery },
    { label: 'Sesi absensi', value: sessionsQuery.data?.length, query: sessionsQuery },
  ]

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-heading-lg font-bold text-ink-900">Beranda Admin</h1>
        <p className="mt-1 text-body-md text-ink-700">Halo {user?.name}, kelola sekolah melalui menu berikut.</p>
      </div>

      {anyNetworkError ? (
        <div
          role="alert"
          className="rounded-radius-md border border-line-200 bg-surface-0 px-4 py-3 text-body-md text-ink-900"
        >
          <span className="text-danger-700">Tidak dapat memuat sebagian ringkasan.</span> {getErrorMessage(usersQuery.error ?? classesQuery.error)}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map((count) => (
          <SummaryCard
            key={count.label}
            label={count.label}
            value={count.value ?? 0}
            loading={count.query.isPending}
            error={count.query.isError}
          />
        ))}
      </div>

      <div>
        <h2 className="text-heading-sm font-bold text-ink-900">Kelola</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((entry) => {
            const Icon = entry.icon
            return (
              <Link
                key={entry.to}
                to={entry.to}
                className="group rounded-radius-md border border-line-200 bg-surface-0 p-5 shadow-1 transition hover:border-school-blue-700 hover:shadow-2 focus-visible:outline-school-blue-700"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-radius-pill bg-school-blue-050">
                    <Icon className="h-5 w-5 text-school-blue-900" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-label-md font-semibold text-ink-900 group-hover:text-school-blue-900">
                      {entry.label}
                    </span>
                    <span className="block text-caption text-ink-700">{entry.description}</span>
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}