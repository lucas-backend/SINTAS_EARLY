import { CalendarDays } from 'lucide-react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SectionState } from '../../components/feedback/SectionState'
import { useIsOnline } from '../../hooks/useIsOnline'
import { formatSchoolDateLong, todaySchoolDate } from '../../lib/dateTime'
import { windowStatusLabel } from '../../lib/attendanceStatus'
import {
  ScheduleCard,
  ScheduleCardSkeleton,
} from '../../features/attendance/ScheduleCard'
import { useTodaySchedule } from '../../features/attendance/hooks/useTodaySchedule'

const GROUP_ORDER = ['BISA_ABSEN', 'BELUM_DIBUKA', 'SELESAI']

function groupItems(items) {
  const groups = new Map()
  GROUP_ORDER.forEach((status) => groups.set(status, []))
  items.forEach((item) => {
    const list = groups.get(item.windowStatus)
    if (list) list.push(item)
  })
  return GROUP_ORDER.map((status) => ({
    status,
    label: windowStatusLabel(status),
    items: groups.get(status),
  })).filter((group) => group.items.length > 0)
}

function GroupList({ items }) {
  const groups = groupItems(items)
  if (groups.length === 0) return null

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.status} aria-label={group.label} className="space-y-3">
          <h2 className="text-heading-sm font-bold text-ink-900">
            {group.label}
            <span className="ml-2 text-caption font-normal text-ink-500">
              {group.items.length} sesi
            </span>
          </h2>
          <ul className="space-y-3">
            {group.items.map((item) => (
              <li key={item.id}>
                <ScheduleCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default function StudentSchedulePage() {
  const online = useIsOnline()
  const today = useTodaySchedule()
  const items = today.data ?? []

  const state = (
    <SectionState
      query={today}
      online={online}
      isEmpty={items.length === 0}
      empty={
        <EmptyState
          title="Belum ada pelajaran pada tanggal ini"
          message="Sesi absensi untuk kelas Anda akan muncul mulai 15 menit sebelum jam mulai."
        />
      }
      skeleton={
        <div className="space-y-3">
          {[0, 1, 2, 3].map((value) => (
            <ScheduleCardSkeleton key={value} />
          ))}
        </div>
      }
      errorTitle="Jadwal tidak dapat dimuat."
    >
      <GroupList items={items} />
    </SectionState>
  )

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-heading-lg font-bold text-ink-900">Jadwal</h1>
        <p className="mt-1 flex items-center gap-1.5 text-body-md text-ink-700">
          <CalendarDays className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
          {formatSchoolDateLong(todaySchoolDate())}
        </p>
      </div>

      {state}
    </section>
  )
}