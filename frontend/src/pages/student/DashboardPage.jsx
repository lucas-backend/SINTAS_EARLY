import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import PermIdentityRoundedIcon from '@mui/icons-material/PermIdentityRounded'
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SectionState } from '../../components/feedback/SectionState'
import { Skeleton } from '../../components/common/Skeleton'
import { useIsOnline } from '../../hooks/useIsOnline'
import { formatSchoolDateLong, formatSchoolTime, todaySchoolDate } from '../../lib/dateTime'
import { useSessionStore } from '../../stores/sessionStore'
import { useActiveBanners } from '../../features/banners/hooks/useActiveBanners'
import BannerCarousel from '../../features/banners/BannerCarousel'
import { useTodaySchedule } from '../../features/attendance/hooks/useTodaySchedule'

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
      skeleton={<Skeleton className="h-32 w-full" />}
      errorTitle="Banner tidak dapat dimuat."
      empty={null}
    >
      {items.length > 0 ? (
        <div className="overflow-hidden rounded-xl">
          <BannerCarousel items={items} />
        </div>
      ) : null}
    </SectionState>
  )
}

function ScheduleRow({ item }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white p-4">
      <div className="flex min-w-0 items-center">
        <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-500">
          <MenuBookRoundedIcon className="h-6! w-6!" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-lg font-semibold text-ink-900">
            {item.subjectName}
          </span>
          <span className="truncate text-sm text-slate-700">
            {item.className}
            {item.teacherName ? ` · ${item.teacherName}` : ''}
          </span>
          <span className="text-xs text-slate-500">
            {formatSchoolTime(item.startAt)}–{formatSchoolTime(item.endAt)}
          </span>
        </div>
      </div>

      {item.scanned ? (
        <span
          aria-label={`Sudah absen ${item.subjectName}`}
          title="Sudah absen"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-green-600"
        >
          <CheckCircleRoundedIcon className="h-9! w-9!" />
        </span>
      ) : (
        <Link
          to={`/app/student/scan?session=${item.id}`}
          aria-label={`Scan QR ${item.subjectName}`}
          title="Scan QR"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white"
        >
          <QrCodeScannerRoundedIcon className="h-6! w-6!" />
        </Link>
      )}
    </li>
  )
}

function TodayScheduleList({ query, online }) {
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
        />
      }
      skeleton={
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((value) => (
            <Skeleton key={value} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      }
      errorTitle="Jadwal tidak dapat dimuat."
    >
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <ScheduleRow key={item.id} item={item} />
        ))}
      </ul>
    </SectionState>
  )
}

export default function StudentDashboardPage() {
  const online = useIsOnline()
  const user = useSessionStore((state) => state.user)
  const today = useTodaySchedule()

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5">
      <header className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
          <PermIdentityRoundedIcon className="h-9! w-9! text-blue-500" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink-900">
            Halo, {firstName(user?.name)}
          </h1>
          <p className="truncate text-sm text-slate-700">
            {formatSchoolDateLong(todaySchoolDate())}
          </p>
        </div>
      </header>

      <BannerSection />

      <section aria-label="Jadwal hari ini" className="space-y-3">
        <h2 className="text-lg font-bold text-ink-900">Jadwal hari ini</h2>
        <TodayScheduleList query={today} online={online} />
      </section>
    </section>
  )
}
