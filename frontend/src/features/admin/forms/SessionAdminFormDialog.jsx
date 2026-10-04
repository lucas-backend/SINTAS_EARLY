import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { getErrorMessage, getFieldErrors } from '../../../lib/errorMapping'
import { SCHOOL_TIMEZONE, schoolDateString, todaySchoolDate } from '../../../lib/dateTime'
import { sessionFormSchema, toSessionPayload } from '../../../schemas/session'
import { useClasses, useSubjects } from '../hooks/useAcademicMasters'
import { useAdminUsers } from '../hooks/useAdminUsers'
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
    return {
      classId: '',
      subjectId: '',
      teacherId: '',
      sessionDate: todaySchoolDate(),
      start: '',
      end: '',
    }
  }
  return {
    classId: session.classId ? String(session.classId) : '',
    subjectId: session.subjectId ? String(session.subjectId) : '',
    teacherId: session.teacherId ? String(session.teacherId) : '',
    sessionDate: schoolDateString(session.sessionDate ?? session.startAt),
    start: schoolTimeString(session.startAt),
    end: schoolTimeString(session.endAt),
  }
}

export function SessionAdminFormDialog({ open, session = null, onClose }) {
  const isEdit = Boolean(session)
  const [rootError, setRootError] = useState(null)
  const createSession = useCreateAdminSession()
  const updateSession = useUpdateAdminSession()
  const mutation = isEdit ? updateSession : createSession
  const { data: classes } = useClasses({ page: 1, limit: 100 })
  const { data: subjects } = useSubjects({ page: 1, limit: 100 })
  const { data: teachers } = useAdminUsers({ page: 1, limit: 100, role: 'TEACHER' })
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
      title={isEdit ? 'Ubah jadwal absensi' : 'Jadwal absensi baru'}
      description="Pilih kelas, mata pelajaran, dan guru. Penugasan guru dibuat otomatis."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {rootError ? (
          <p role="alert" className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white">
            {rootError}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-session-class" className="block text-sm font-medium text-slate-700">
              Kelas
            </label>
            <select
              id="admin-session-class"
              className={inputClass}
              aria-invalid={errors.classId ? true : undefined}
              aria-describedby={errors.classId ? 'admin-session-class-error' : undefined}
              {...register('classId')}
            >
              <option value="">Pilih kelas</option>
              {classes?.items?.map((entry) => (
                <option key={entry.id} value={String(entry.id)}>
                  {entry.name}
                </option>
              ))}
            </select>
            <FieldError id="admin-session-class-error" message={errors.classId?.message} />
          </div>

          <div>
            <label htmlFor="admin-session-subject" className="block text-sm font-medium text-slate-700">
              Mata pelajaran
            </label>
            <select
              id="admin-session-subject"
              className={inputClass}
              aria-invalid={errors.subjectId ? true : undefined}
              aria-describedby={errors.subjectId ? 'admin-session-subject-error' : undefined}
              {...register('subjectId')}
            >
              <option value="">Pilih mata pelajaran</option>
              {subjects?.items?.map((entry) => (
                <option key={entry.id} value={String(entry.id)}>
                  {entry.name}
                </option>
              ))}
            </select>
            <FieldError id="admin-session-subject-error" message={errors.subjectId?.message} />
          </div>
        </div>

        <div>
          <label htmlFor="admin-session-teacher" className="block text-sm font-medium text-slate-700">
            Guru
          </label>
          <select
            id="admin-session-teacher"
            className={inputClass}
            aria-invalid={errors.teacherId ? true : undefined}
            aria-describedby={errors.teacherId ? 'admin-session-teacher-error' : undefined}
            {...register('teacherId')}
          >
            <option value="">Pilih guru</option>
            {teachers?.items?.map((entry) => (
              <option key={entry.id} value={String(entry.id)}>
                {entry.name}
              </option>
            ))}
          </select>
          <FieldError id="admin-session-teacher-error" message={errors.teacherId?.message} />
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
