import { Link } from 'react-router-dom'
import { Skeleton } from '../../components/common/Skeleton'
import { formatSchoolTime } from '../../lib/dateTime'

function durationMinutes(startAt, endAt) {
  const minutes = Math.round((new Date(endAt) - new Date(startAt)) / 60_000)
  return Number.isFinite(minutes) && minutes > 0 ? minutes : null
}

// Kartu jadwal guru (PLAN_JADWAL_GURU G4): nama kelas utama, mapel/topik
// sekunder, rentang jam + durasi, aksi Lihat QR & Kehadiran. Tanpa ikon mapel.
export function TeacherScheduleCard({ session }) {
  const duration = durationMinutes(session.startAt, session.endAt)
  const className = session.className ?? '—'
  const subjectName = session.subjectName ?? '—'

  return (
    <article
      aria-label={`${className}, ${subjectName}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white p-4"
    >
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-xl font-semibold text-ink-900">
          {className}
        </span>
        <span className="truncate text-sm text-slate-700">{subjectName}</span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex flex-col items-end">
          <span className="font-semibold text-ink-900">
            {formatSchoolTime(session.startAt)}–{formatSchoolTime(session.endAt)}
          </span>
          {duration ? (
            <span className="text-sm text-slate-700">{duration} menit</span>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Link
            to={`/app/teacher/sessions/${session.id}/qr`}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-blue-500 hover:bg-blue-100/50"
          >
            Lihat QR
          </Link>
          <Link
            to={`/app/teacher/classes/${session.classId}/attendance`}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-blue-500 hover:bg-blue-100/50"
          >
            Kehadiran
          </Link>
        </div>
      </div>
    </article>
  )
}

export function TeacherScheduleCardSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white p-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  )
}