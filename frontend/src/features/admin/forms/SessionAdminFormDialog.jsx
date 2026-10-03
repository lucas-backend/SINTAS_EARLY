import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { getErrorMessage, getFieldErrors } from '../../../lib/errorMapping'
import { SCHOOL_TIMEZONE, schoolDateString, todaySchoolDate } from '../../../lib/dateTime'
import { sessionFormSchema, toSessionPayload } from '../../../schemas/session'
import { useCreateAdminSession, useUpdateAdminSession } from '../hooks/useAdminSessions'
import { DialogShell, FieldError, inputClass } from './DialogShell'

function schoolTimeString(value) {
  if (!value) return ''
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SCHOOL_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value))
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${map.hour}:${map.minute}`
}

function defaultValues(session) {
  if (!session) {
    return { assignmentId: '', sessionDate: todaySchoolDate(), start: '', end: '' }
  }
  return {
    assignmentId: String(session.assignmentId),
    sessionDate: schoolDateString(session.sessionDate ?? session.startAt),
    start: schoolTimeString(session.startAt),
    end: schoolTimeString(session.endAt),
  }
}

export function SessionAdminFormDialog({ open, session = null, assignments = [], onClose }) {
  const isEdit = Boolean(session)
  const [rootError, setRootError] = useState(null)
  const createSession = useCreateAdminSession()
  const updateSession = useUpdateAdminSession()
  const mutation = isEdit ? updateSession : createSession
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: defaultValues(session),
  })

  const onSubmit = (values) => {
    setRootError(null)
    const payload = toSessionPayload(values)
    const request = isEdit
      ? updateSession.mutateAsync({ id: session.id, data: payload })
      : createSession.mutateAsync(payload)
    request
      .then(() => onClose())
      .catch((error) => {
        const entries = Object.entries(getFieldErrors(error))
        if (entries.length === 0) setRootError(getErrorMessage(error))
        else setRootError(entries.map(([, messages]) => messages[0]).join(' '))
      })
  }

  return (
    <DialogShell
      open={open}
      title={isEdit ? 'Ubah sesi absensi' : 'Sesi absensi baru'}
      description="Sesi yang sudah memiliki kehadiran tidak dapat diubah atau dihapus."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {rootError ? (
          <p role="alert" className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white">
            {rootError}
          </p>
        ) : null}

        <div>
          <label htmlFor="admin-session-assignment" className="block text-sm font-medium text-slate-700">
            Penugasan
          </label>
          <select
            id="admin-session-assignment"
            className={inputClass}
            aria-invalid={errors.assignmentId ? true : undefined}
            aria-describedby={errors.assignmentId ? 'admin-session-assignment-error' : undefined}
            {...register('assignmentId')}
          >
            <option value="">Pilih kelas dan mata pelajaran</option>
            {assignments.map((entry) => (
              <option key={entry.id} value={String(entry.id)}>
                {entry.class?.name ?? '—'} — {entry.subject?.name ?? '—'}
                {entry.teacher?.name ? ` (${entry.teacher.name})` : ''}
              </option>
            ))}
          </select>
          <FieldError id="admin-session-assignment-error" message={errors.assignmentId?.message} />
        </div>

        <div>
          <label htmlFor="admin-session-date" className="block text-sm font-medium text-slate-700">
            Tanggal
          </label>
          <input
            id="admin-session-date"
            type="date"
            className={inputClass}
            aria-invalid={errors.sessionDate ? true : undefined}
            aria-describedby={errors.sessionDate ? 'admin-session-date-error' : undefined}
            {...register('sessionDate')}
          />
          <FieldError id="admin-session-date-error" message={errors.sessionDate?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-session-start" className="block text-sm font-medium text-slate-700">
              Jam mulai
            </label>
            <input
              id="admin-session-start"
              type="time"
              className={inputClass}
              aria-invalid={errors.start ? true : undefined}
              aria-describedby={errors.start ? 'admin-session-start-error' : undefined}
              {...register('start')}
            />
            <FieldError id="admin-session-start-error" message={errors.start?.message} />
          </div>
          <div>
            <label htmlFor="admin-session-end" className="block text-sm font-medium text-slate-700">
              Jam selesai
            </label>
            <input
              id="admin-session-end"
              type="time"
              className={inputClass}
              aria-invalid={errors.end ? true : undefined}
              aria-describedby={errors.end ? 'admin-session-end-error' : undefined}
              {...register('end')}
            />
            <FieldError id="admin-session-end-error" message={errors.end?.message} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-100/50 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {mutation.isPending ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Buat sesi'}
          </button>
        </div>
      </form>
    </DialogShell>
  )
}
