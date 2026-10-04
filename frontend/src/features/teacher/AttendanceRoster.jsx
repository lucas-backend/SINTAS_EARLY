import { useState } from 'react'
import { StatusBadge } from '../../components/common/StatusBadge'
import { DialogShell } from '../admin/forms/DialogShell'
import {
  ATTENDANCE_SUMMARY_CARDS,
  attendanceStatusLabel,
  attendanceStatusLetter,
  attendanceStatusTone,
} from '../../lib/attendanceStatus'
import { formatSchoolDateLong, formatSchoolTime } from '../../lib/dateTime'

const LETTERS = [
  { letter: 'H', status: 'HADIR', manual: false },
  { letter: 'I', status: 'IZIN', manual: true },
  { letter: 'S', status: 'SAKIT', manual: true },
  { letter: 'A', status: 'ALFA', manual: true },
  { letter: 'D', status: 'DISPEN', manual: true },
]

const TONE_ACTIVE = {
  success: 'border-green-600/40 bg-green-500/20 text-green-700',
  warning: 'border-orange-500/40 bg-orange-400/20 text-orange-700',
  danger: 'border-red-500/40 bg-red-500/20 text-red-600',
  info: 'border-blue-500/40 bg-blue-100 text-blue-600',
  neutral: 'border-slate-400/40 bg-slate-200 text-slate-700',
}

const TONE_CARD = {
  success: 'bg-green-500/10 text-green-700',
  warning: 'bg-orange-400/10 text-orange-700',
  danger: 'bg-red-500/10 text-red-600',
  info: 'bg-blue-100 text-blue-600',
  neutral: 'bg-slate-200 text-slate-700',
}

export function AttendanceSummaryCards({ summary }) {
  return (
    <dl className="grid grid-cols-5 gap-2">
      {ATTENDANCE_SUMMARY_CARDS.map((card) => {
        const count = card.statuses.reduce(
          (total, status) => total + (summary?.[status] ?? 0),
          0,
        )
        return (
          <div
            key={card.key}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-3 ${TONE_CARD[card.tone]}`}
          >
            <dd className="text-xl font-bold">{count}</dd>
            <dt className="text-xs font-semibold uppercase tracking-wide">
              {card.label}
            </dt>
          </div>
        )
      })}
    </dl>
  )
}

function StatusLetterButton({ entry, item, onSetStatus, onClearStatus, isPending }) {
  const isActive = attendanceStatusLetter(entry.status) === item.letter

  const handleClick = () => {
    if (!item.manual) return
    if (entry.status === item.status) {
      onClearStatus(entry)
      return
    }
    onSetStatus(entry, item.status)
  }

  // H hanya menampilkan status hasil scan. Guru hanya mengisi I/S/A/D, dan
  // tidak dapat mengubah status siswa yang sudah melakukan scan.
  const disabled = isPending || entry.scanned || !item.manual

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={isActive}
      title={entry.scanned ? 'Siswa sudah scan; status terkunci.' : undefined}
      aria-label={
        item.manual
          ? `Tandai ${attendanceStatusLabel(item.status)} untuk ${entry.studentName}`
          : `Status ${attendanceStatusLabel(item.status)} untuk ${entry.studentName}`
      }
      onClick={handleClick}
      className={`h-10 w-10 rounded-lg border text-base font-bold transition disabled:cursor-not-allowed ${
        isActive
          ? TONE_ACTIVE[attendanceStatusTone(entry.status)]
          : 'border-black/10 bg-white text-slate-700 enabled:hover:bg-blue-100/60'
      } ${disabled && !isActive ? 'opacity-60' : ''}`}
    >
      {item.letter}
    </button>
  )
}

function DetailDialog({ open, entry, session, onClose }) {
  return (
    <DialogShell
      open={open}
      title={entry?.studentName ?? 'Detail siswa'}
      description={session ? `${session.className ?? '—'} · ${session.subjectName ?? '—'}` : undefined}
      onClose={onClose}
    >
      {entry ? (
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-700">NIM</dt>
            <dd className="font-semibold text-ink-900">
              {entry.studentNumber ?? '—'}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-700">Tanggal sesi</dt>
            <dd className="font-semibold text-ink-900">
              {formatSchoolDateLong(session.sessionDate)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-700">Jam scan</dt>
            <dd className="font-semibold text-ink-900">
              {entry.scannedAt ? formatSchoolTime(entry.scannedAt) : '—'}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-700">Menit terlambat</dt>
            <dd className="font-semibold text-ink-900">
              {entry.status === 'TERLAMBAT'
                ? `${entry.lateMinutes} menit`
                : '—'}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-700">Status</dt>
            <dd>
              <StatusBadge
                status={entry.status}
                tone={attendanceStatusTone(entry.status)}
                label={attendanceStatusLabel(entry.status) ?? 'Belum absen'}
              />
            </dd>
          </div>
        </dl>
      ) : null}
    </DialogShell>
  )
}

export function ClassAttendanceRoster({
  session,
  students,
  onSetStatus,
  onClearStatus,
  isPending,
}) {
  const [detailEntry, setDetailEntry] = useState(null)

  return (
    <>
      <ul className="space-y-3">
        {students.map((entry) => (
          <li
            key={entry.studentId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-100 p-4"
          >
            <p className="min-w-0 flex-1 truncate font-semibold text-ink-900">
              {entry.studentName}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {LETTERS.map((item) => (
                  <StatusLetterButton
                    key={item.letter}
                    entry={entry}
                    item={item}
                    onSetStatus={onSetStatus}
                    onClearStatus={onClearStatus}
                    isPending={isPending}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setDetailEntry(entry)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-blue-500 hover:bg-white/60"
              >
                Detail
              </button>
            </div>
          </li>
        ))}
      </ul>

      <DetailDialog
        open={detailEntry !== null}
        entry={detailEntry}
        session={session}
        onClose={() => setDetailEntry(null)}
      />
    </>
  )
}
