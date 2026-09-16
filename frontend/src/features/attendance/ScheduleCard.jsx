import { CalendarDays, Clock } from 'lucide-react'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Skeleton } from '../../components/common/Skeleton'
import {
  attendanceStatusLabel,
  attendanceStatusTone,
  windowStatusLabel,
  windowStatusTone,
} from '../../lib/attendanceStatus'
import { formatSchoolTime } from '../../lib/dateTime'

function durationMinutes(startAt, endAt) {
  const minutes = Math.round((new Date(endAt) - new Date(startAt)) / 60_000)
  return Number.isFinite(minutes) && minutes > 0 ? minutes : null
}

export function ScheduleCard({ item }) {
  const start = formatSchoolTime(item.startAt)
  const end = formatSchoolTime(item.endAt)
  const duration = durationMinutes(item.startAt, item.endAt)
  const attendanceLabel = attendanceStatusLabel(item.attendanceStatus)

  return (
    <article
      aria-label={`${item.subjectName}, ${item.startAt}`}
      className="rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <div className="min-w-0">
            <p className="text-data text-ink-900">
              <span aria-label={`Jam mulai ${start}`}>{start}</span>
              <span aria-hidden="true">–</span>
              <span aria-label={`jam selesai ${end}`}>{end}</span>
            </p>
            {duration ? (
              <p className="mt-0.5 flex items-center gap-1 text-caption text-ink-500">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {duration} menit
              </p>
            ) : null}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-heading-sm font-bold text-ink-900">
              {item.subjectName}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-caption text-ink-700">
              <CalendarDays className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {item.className}
                {item.teacherName ? ` • ${item.teacherName}` : ''}
              </span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge
            status={item.windowStatus}
            label={windowStatusLabel(item.windowStatus)}
            tone={windowStatusTone(item.windowStatus)}
          />
          {attendanceLabel ? (
            <StatusBadge
              status={item.attendanceStatus}
              label={attendanceLabel}
              tone={attendanceStatusTone(item.attendanceStatus)}
            />
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function ScheduleCardSkeleton() {
  return (
    <div className="rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 rounded-radius-pill" />
      </div>
    </div>
  )
}