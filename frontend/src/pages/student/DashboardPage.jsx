import { ArrowRight, CalendarDays, ClipboardList, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SectionState } from '../../components/feedback/SectionState'
import { Skeleton } from '../../components/common/Skeleton'
import { useIsOnline } from '../../hooks/useIsOnline'
import { formatSchoolDateLong, todaySchoolDate } from '../../lib/dateTime'
import { useSessionStore } from '../../stores/sessionStore'
import { useActiveBanners } from '../../features/banners/hooks/useActiveBanners'
import { ActiveBanner } from '../../features/banners/ActiveBanner'
import {
  ScheduleCard,
  ScheduleCardSkeleton,
} from '../../features/attendance/ScheduleCard'
import { useTodaySchedule } from '../../features/attendance/hooks/useTodaySchedule'
import { AttendanceSummary } from '../../features/student/AttendanceSummary'

function firstName(name = '') {
  return name.trim().split(/\s+/)[0] || 'Siswa'
}

function BannerSection() {
  const online = useIsOnline()
  const banners = useActiveBanners()
  const items = banners.data ?? []

  return (
    <SectionState
      query={banners}
      online={online}
      skeleton={<Skeleton className="h-32 w-full md:h-40" />}
      errorTitle="Banner tidak dapat dimuat."
      empty={null}
    >
      {items.length > 0 ? (
        <div className="flex snap-x gap-4 overflow-x-auto pb-1 motion-reduce:scroll-auto">
          {items.map((banner) => (
            <div key={banner.id} className="min-w-[85%] snap-start sm:min-w-[380px]">
              <ActiveBanner banner={banner} />
            </div>
          ))}
        </div>
      ) : null}
    </SectionState>
  )
}

function ScheduleItems({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <ScheduleCard item={item} />
        </li>
      ))}
    </ul>
  )
}

function TodaySummary({ query, online }) {
  return (
    <SectionState
      query={query}
      online={online}
      skeleton={
        <div className="rounded-radius-md border border-line-200 bg-surface-0 p-5 shadow-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
      }
    >
      <AttendanceSummary items={query.data ?? []} />
    </SectionState>
  )
}

function ScheduleSection({ query, online }) {
  const items = query.data ?? []

  return (
    <SectionState
      query={query}
      online={online}
      isEmpty={items.length === 0}
      empty={
        <EmptyState
          title="Belum ada jadwal hari ini"
          message="Jadwal sesi akan muncul di sini."
          action={
            <Link
              to="/app/student/schedule"
              className="mt-1 rounded-radius-md bg-school-blue-700 px-4 py-2 text-label-md text-white"
            >
              Lihat jadwal
            </Link>
          }
        />
      }
      skeleton={
        <div className="space-y-3">
          {[0, 1, 2].map((value) => (
            <ScheduleCardSkeleton key={value} />
          ))}
        </div>
      }
      errorTitle="Jadwal tidak dapat dimuat."
    >
      <ScheduleItems items={items.slice(0, 3)} />
    </SectionState>
  )
}

export default function StudentDashboardPage() {
  const online = useIsOnline()
  const user = useSessionStore((state) => state.user)
  const today = useTodaySchedule()

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-display-sm font-bold text-ink-900">
          Halo, {firstName(user?.name)}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-body-md text-ink-700">
          <CalendarDays className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
          {formatSchoolDateLong(todaySchoolDate())}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <section aria-label="Ringkasan absensi hari ini">
            <TodaySummary query={today} online={online} />
          </section>

          <section aria-label="Jadwal terdekat" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-heading-md font-bold text-ink-900">
                Jadwal terdekat
              </h2>
              <Link
                to="/app/student/schedule"
                className="inline-flex items-center gap-1 rounded-radius-sm px-2 py-1 text-label-md font-semibold text-school-blue-700 focus-visible:outline-school-blue-700"
              >
                Lihat jadwal
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ScheduleSection query={today} online={online} />
          </section>
        </div>

        <div className="space-y-6">
          <section aria-label="Banner sekolah" className="space-y-3">
            <h2 className="text-heading-sm font-bold text-ink-900">
              Pengumuman sekolah
            </h2>
            <BannerSection />
          </section>

          <nav aria-label="Akses cepat" className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <Link
              to="/app/student/history"
              className="flex items-center gap-3 rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1 hover:bg-surface-50"
            >
              <ClipboardList className="h-5 w-5 shrink-0 text-school-blue-700" aria-hidden="true" />
              <span>
                <span className="block text-label-md font-semibold text-ink-900">
                  Riwayat absensi
                </span>
                <span className="block text-caption text-ink-700">
                  Lihat catatan kehadiran pribadi.
                </span>
              </span>
            </Link>
            <Link
              to="/app/student/profile"
              className="flex items-center gap-3 rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1 hover:bg-surface-50"
            >
              <User className="h-5 w-5 shrink-0 text-school-blue-700" aria-hidden="true" />
              <span>
                <span className="block text-label-md font-semibold text-ink-900">
                  Profil
                </span>
                <span className="block text-caption text-ink-700">
                  Perbarui data profil Anda.
                </span>
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </section>
  )
}