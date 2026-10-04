import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SectionState } from '../../components/feedback/SectionState'
import { Skeleton } from '../../components/common/Skeleton'
import {
  AttendanceSummaryCards,
  ClassAttendanceRoster,
} from '../../features/teacher/AttendanceRoster'
import { useClearManualAttendanceStatus } from '../../features/teacher/hooks/useClearManualAttendanceStatus'
import { useExportReport } from '../../features/teacher/hooks/useExportReport'
import { useSessionRoster } from '../../features/teacher/hooks/useSessionRoster'
import { useSetManualAttendanceStatus } from '../../features/teacher/hooks/useSetManualAttendanceStatus'
import { useTeacherSessions } from '../../features/teacher/hooks/useTeacherSessions'
import { useIsOnline } from '../../hooks/useIsOnline'
import { getErrorMessage } from '../../lib/errorMapping'
import { formatSchoolDate, formatSchoolTime } from '../../lib/dateTime'

function sessionLabel(session) {
  return `${formatSchoolDate(session.sessionDate)} • ${session.subjectName ?? '—'} • ${formatSchoolTime(session.startAt)}–${formatSchoolTime(session.endAt)}`
}

export default function TeacherClassAttendancePage() {
  const online = useIsOnline()
  const { classId: classIdParam } = useParams()
  const classId = Number(classIdParam)

  const sessionsQuery = useTeacherSessions()
  const sessions = useMemo(
    () => (sessionsQuery.data ?? []).filter((session) => session.classId === classId),
    [sessionsQuery.data, classId],
  )

  const [selectedId, setSelectedId] = useState(null)
  const activeSession = useMemo(
    () => sessions.find((session) => session.id === selectedId) ?? sessions[0] ?? null,
    [sessions, selectedId],
  )

  const roster = useSessionRoster(activeSession?.id)
  const setStatus = useSetManualAttendanceStatus()
  const clearStatus = useClearManualAttendanceStatus()
  const exporter = useExportReport()
  const [exportMessage, setExportMessage] = useState(null)

  const students = useMemo(() => roster.data?.students ?? [], [roster.data])
  const summary = useMemo(
    () =>
      students.reduce((accumulator, entry) => {
        if (entry.status) {
          accumulator[entry.status] = (accumulator[entry.status] ?? 0) + 1
        }
        return accumulator
      }, {}),
    [students],
  )

  const isPending = setStatus.isPending || clearStatus.isPending
  const mutationError = setStatus.error ?? clearStatus.error

  const handleSetStatus = (entry, status) =>
    setStatus.mutate({
      sessionId: activeSession.id,
      studentId: entry.studentId,
      status,
    })

  const handleClearStatus = (entry) =>
    clearStatus.mutate({
      sessionId: activeSession.id,
      studentId: entry.studentId,
    })

  const onExport = async () => {
    setExportMessage(null)
    try {
      await exporter.mutateAsync({ classId })
      setExportMessage({ tone: 'success', text: 'Laporan kehadiran sedang diunduh.' })
    } catch (error) {
      setExportMessage({ tone: 'error', text: getErrorMessage(error) })
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <Link
          to="/app/teacher/sessions"
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-blue-500"
        >
          <ArrowBackRoundedIcon className="h-4! w-4!" aria-hidden="true" />
          Kembali ke daftar sesi
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-ink-900">
          Kehadiran kelas
        </h1>
        <p className="mt-1 text-sm text-slate-700">
          Pilih pertemuan, lalu tandai status Izin/Sakit/Alfa/Dispen. Status
          Hadir dan Terlambat berasal dari scan; Alfa otomatis untuk sesi yang
          sudah berakhir tanpa kehadiran.
        </p>
      </div>

      <SectionState
        query={sessionsQuery}
        online={online}
        isEmpty={sessions.length === 0}
        empty={
          <EmptyState
            title="Belum ada jadwal untuk kelas ini"
            message="Jadwal sesi akan tampil setelah admin membuatnya untuk kelas yang Anda ajar."
          />
        }
        skeleton={<Skeleton className="h-24 w-full rounded-xl" />}
        errorTitle="Jadwal kelas tidak dapat dimuat."
      >
        {activeSession ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-black/10 bg-white p-4">
              {sessions.length > 1 ? (
                <label className="flex-1 text-sm font-medium text-slate-700">
                  Pertemuan
                  <select
                    value={activeSession.id}
                    onChange={(event) => setSelectedId(Number(event.target.value))}
                    className="mt-1 block w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-ink-900"
                  >
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {sessionLabel(session)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div>
                  <p className="text-xl font-bold text-ink-900">
                    {activeSession.className ?? '—'}
                  </p>
                  <p className="text-sm text-slate-700">
                    {activeSession.subjectName ?? '—'} ·{' '}
                    {formatSchoolDate(activeSession.sessionDate)} ·{' '}
                    {formatSchoolTime(activeSession.startAt)}–
                    {formatSchoolTime(activeSession.endAt)}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={onExport}
                disabled={exporter.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-100/50 disabled:opacity-60"
              >
                <DownloadRoundedIcon className="h-4! w-4!" aria-hidden="true" />
                {exporter.isPending ? 'Menyiapkan…' : 'Export XLSX'}
              </button>
            </div>

            {exportMessage ? (
              <p
                role={exportMessage.tone === 'error' ? 'alert' : 'status'}
                className={
                  exportMessage.tone === 'error'
                    ? 'rounded-lg bg-red-500 px-3 py-2 text-sm text-white'
                    : 'rounded-lg bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-600'
                }
              >
                {exportMessage.text}
              </p>
            ) : null}

            <SectionState
              query={roster}
              online={online}
              isEmpty={students.length === 0}
              empty={
                <EmptyState
                  title="Belum ada siswa di kelas ini"
                  message="Penempatan siswa diatur admin pada halaman Pengguna."
                />
              }
              skeleton={
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((value) => (
                    <Skeleton key={value} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              }
              errorTitle="Daftar kehadiran tidak dapat dimuat."
            >
              <AttendanceSummaryCards summary={summary} />

              {mutationError ? (
                <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
                  {getErrorMessage(mutationError)}
                </p>
              ) : null}

              <ClassAttendanceRoster
                session={activeSession}
                students={students}
                onSetStatus={handleSetStatus}
                onClearStatus={handleClearStatus}
                isPending={isPending}
              />
            </SectionState>
          </div>
        ) : null}
      </SectionState>
    </section>
  )
}
