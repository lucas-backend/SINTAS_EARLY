import { EmptyState } from '../../components/feedback/EmptyState'
import { SectionState } from '../../components/feedback/SectionState'
import { Skeleton } from '../../components/common/Skeleton'
import { SessionDesktopTable, SessionMobileList } from '../../features/teacher/SessionViews'
import { useTeacherSessions } from '../../features/teacher/hooks/useTeacherSessions'
import { useIsOnline } from '../../hooks/useIsOnline'

export default function TeacherSessionsPage() {
  const online = useIsOnline()
  const sessionsQuery = useTeacherSessions()
  const sessions = sessionsQuery.data ?? []

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Sesi absensi</h1>
        <p className="mt-1 text-sm text-slate-700">
          Jadwal sesi dari admin untuk kelas yang Anda ajar, diurutkan dari yang
          terbaru menurut server.
        </p>
      </div>

      <SectionState
        query={sessionsQuery}
        online={online}
        isEmpty={sessions.length === 0}
        empty={
          <EmptyState
            title="Belum ada sesi absensi"
            message="Jadwal sesi akan tampil setelah admin membuatnya."
          />
        }
        skeleton={
          <div className="space-y-3">
            {[0, 1, 2, 3].map((value) => (
              <Skeleton key={value} className="h-20 w-full" />
            ))}
          </div>
        }
        errorTitle="Sesi absensi tidak dapat dimuat."
      >
        <SessionMobileList items={sessions} />
        <SessionDesktopTable items={sessions} />
      </SectionState>
    </section>
  )
}
