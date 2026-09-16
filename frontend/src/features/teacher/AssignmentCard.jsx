import { BookOpen, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AssignmentCard({ assignment, teacherName }) {
  const subjectName = assignment.subject?.name ?? 'Mata pelajaran'
  const className = assignment.class?.name ?? 'Kelas'
  const levelName = assignment.class?.educationLevel?.name
  const destination = `/app/teacher/sessions/new?assignmentId=${assignment.id}`

  return (
    <article className="flex flex-col justify-between gap-4 rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1">
      <div className="min-w-0">
        <h3 className="truncate text-heading-sm font-bold text-ink-900">{subjectName}</h3>
        <dl className="mt-2 space-y-1.5 text-body-md text-ink-700">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Kelas</dt>
            <BookOpen className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
            <dd className="truncate">
              {className}
              {levelName ? ` • ${levelName}` : ''}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Guru</dt>
            <GraduationCap className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
            <dd className="truncate">{teacherName ?? '—'}</dd>
          </div>
        </dl>
      </div>
      <Link
        to={destination}
        className="inline-flex items-center justify-center gap-1.5 rounded-radius-md bg-school-blue-700 px-4 py-2.5 text-label-md text-white hover:bg-school-blue-900"
      >
        Buat sesi
      </Link>
    </article>
  )
}

export function AssignmentCardSkeleton() {
  return (
    <div className="rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1">
      <div className="h-5 w-32 animate-pulse rounded-radius-md bg-line-200 motion-reduce:animate-none" />
      <div className="mt-3 h-4 w-40 animate-pulse rounded-radius-md bg-line-200 motion-reduce:animate-none" />
      <div className="mt-2 h-4 w-32 animate-pulse rounded-radius-md bg-line-200 motion-reduce:animate-none" />
      <div className="mt-4 h-10 w-full animate-pulse rounded-radius-md bg-line-200 motion-reduce:animate-none" />
    </div>
  )
}
