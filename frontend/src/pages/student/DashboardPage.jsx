import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded'
import PermIdentityRoundedIcon from '@mui/icons-material/PermIdentityRounded'
import { SectionState } from '../../components/feedback/SectionState'
import { Skeleton } from '../../components/common/Skeleton'
import FeatureGrid from '../../components/common/FeatureGrid'
import { useIsOnline } from '../../hooks/useIsOnline'
import { formatSchoolDateLong, todaySchoolDate } from '../../lib/dateTime'
import { useSessionStore } from '../../stores/sessionStore'
import { useActiveBanners } from '../../features/banners/hooks/useActiveBanners'
import BannerCarousel from '../../features/banners/BannerCarousel'

// Fitur beranda siswa mengikuti golden master FeatureGrid (PLAN_MERGE_UI §5.2)
// dengan route produksi, bukan route mock.
const STUDENT_FEATURES = [
  { name: 'Absen', link: '/app/student/scan', icon: QrCodeScannerRoundedIcon },
  { name: 'Jadwal', link: '/app/student/schedule', icon: CalendarMonthRoundedIcon },
  { name: 'Profil', link: '/app/student/profile', icon: PersonOutlineRoundedIcon },
]

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

export default function StudentDashboardPage() {
  const user = useSessionStore((state) => state.user)

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5">
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
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
        </div>
      </header>

      <BannerSection />

      <FeatureGrid features={STUDENT_FEATURES} />
    </section>
  )
}
