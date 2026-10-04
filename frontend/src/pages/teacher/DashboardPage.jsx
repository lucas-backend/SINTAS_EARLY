import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SectionState } from '../../components/feedback/SectionState'
import { DatePickerDialog } from '../../features/teacher/DatePickerDialog'
import { ScheduleDateStrip } from '../../features/teacher/ScheduleDateStrip'
import {
  TeacherScheduleCard,
  TeacherScheduleCardSkeleton,
} from '../../features/teacher/TeacherScheduleCard'
import { SessionDesktopTable } from '../../features/teacher/SessionViews'
import { useTeacherSessions } from '../../features/teacher/hooks/useTeacherSessions'
import { useIsOnline } from '../../hooks/useIsOnline'
import { todaySchoolDate } from '../../lib/dateTime'
import {
  groupSessionsBySchoolDate,
  scheduleDateLabel,
} from '../../lib/scheduleDates'

function sortByStart(items) {
  return [...items].sort(
    (a, b) => new Date(a.startAt) - new Date(b.startAt),
  )
}

export default function TeacherDashboardPage() {
  const online = useIsOnline()
  const sessionsQuery = useTeacherSessions()
  const sessions = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data])

  const [selectedDate, setSelectedDate] = useState(todaySchoolDate)
  const [pickerOpen, setPickerOpen] = useState(false)

  const sessionsByDate = useMemo(
    () => groupSessionsBySchoolDate(sessions),
    [sessions],
  )
  const selectedSessions = useMemo(
    () => sortByStart(sessionsByDate.get(selectedDate) ?? []),
    [sessionsByDate, selectedDate],
  )

  const handleSelect = (iso) => {
    setSelectedDate(iso)
    setPickerOpen(false)
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Beranda Guru</h1>
        <p className="mt-1 text-sm text-slate-700">
          Pantau jadwal absensi dan kehadiran kelas yang Anda ajar.
        </p>
        <ScheduleDateStrip
          selectedDate={selectedDate}
          sessionsByDate={sessionsByDate}
          onSelect={handleSelect}
          onOpenPicker={() => setPickerOpen(true)}
          onToday={() => handleSelect(todaySchoolDate())}
          isToday={selectedDate === todaySchoolDate()}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-ink-900">
          {scheduleDateLabel(selectedDate)}
          {selectedSessions.length > 0 ? (
            <span className="ml-2 text-xs font-normal text-slate-700">
              {selectedSessions.length} sesi
            </span>
          ) : null}
        </h2>

        <SectionState
          query={sessionsQuery}
          online={online}
          isEmpty={selectedSessions.length === 0}
          empty={
            <EmptyState
              title="Tidak ada jadwal pada tanggal ini"
              message="Jadwal sesi akan tampil setelah admin membuatnya untuk kelas yang Anda ajar."
            />
          }
          skeleton={
            <div className="space-y-3">
              {[0, 1, 2, 3].map((value) => (
                <TeacherScheduleCardSkeleton key={value} />
              ))}
            </div>
          }
          errorTitle="Jadwal tidak dapat dimuat."
        >
          <ul className="space-y-3 sm:hidden">
            {selectedSessions.map((session) => (
              <li key={session.id}>
                <TeacherScheduleCard session={session} />
              </li>
            ))}
          </ul>
          <SessionDesktopTable items={selectedSessions} showDate={false} />
        </SectionState>
      </div>

      <DatePickerDialog
        open={pickerOpen}
        value={selectedDate}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
      />
    </section>
  )
}
