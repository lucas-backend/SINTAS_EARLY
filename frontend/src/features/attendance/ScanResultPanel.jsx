import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  Repeat2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  attendanceStatusLabel,
  attendanceStatusTone,
} from '../../lib/attendanceStatus'
import { formatSchoolDate, formatSchoolDateTime } from '../../lib/dateTime'
import { StatusBadge } from '../../components/common/StatusBadge'
import { scanErrorPanel } from './scanFlow'

function DetailRow({ label, value }) {
  return value ? (
    <div className="flex items-start justify-between gap-4 text-body-md">
      <span className="text-ink-500">{label}</span>
      <span className="text-right text-data text-ink-900">{value}</span>
    </div>
  ) : null
}

const TONE_ICONS = {
  success: CheckCircle2,
  warning: Clock,
  danger: AlertTriangle,
  info: Info,
  neutral: CheckCircle2,
}

// Satu template hasil scan untuk Hadir, Terlambat, duplicate, dan gagal
// (docs/DESIGN_BRIEF.md section 4.2 S4). Semua nilai berasal dari response
// server — client tidak menghitung status.
export function ScanResultPanel({
  result,
  sessionItem,
  isPending = false,
  onRetry,
  onManual,
}) {
  if (result.kind === 'success') {
    const data = result.data
    const isDuplicate = data.duplicate === true
    const label = attendanceStatusLabel(data.status)
    const tone = attendanceStatusTone(data.status)

    return (
      <div
        role="region"
        aria-label="Hasil pemindaian absensi"
        className="mx-auto w-full max-w-md rounded-radius-md border border-line-200 bg-surface-0 p-6 shadow-1"
      >
        <div className="flex flex-col items-center text-center">
          <CheckCircle2
            className="h-10 w-10 text-success-700"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-heading-md font-bold text-ink-900">
            {isDuplicate
              ? 'Absensi sudah tercatat'
              : data.status === 'TERLAMBAT'
                ? 'Absensi terlambat'
                : 'Absensi tercatat'}
          </h2>
          <div className="mt-2">
            <StatusBadge status={data.status} label={label} tone={tone} />
          </div>
          {isDuplicate ? (
            <p className="mt-2 flex items-center gap-1.5 text-body-md text-ink-700">
              <Repeat2 className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
              Absensi untuk sesi ini sudah tercatat pada pukul{' '}
              {formatSchoolDateTime(data.scannedAt)}.
            </p>
          ) : null}
          <p className="mt-1 text-caption text-ink-700">
            Waktu scan: {formatSchoolDateTime(data.scannedAt)}
          </p>
        </div>

        <dl className="mt-5 space-y-2 border-t border-line-200 pt-4">
          <DetailRow label="Mata pelajaran" value={sessionItem?.subjectName} />
          <DetailRow label="Kelas" value={sessionItem?.className} />
          <DetailRow
            label="Tanggal sesi"
            value={sessionItem ? formatSchoolDate(sessionItem.sessionDate) : null}
          />
          {data.status === 'TERLAMBAT' && data.lateMinutes > 0 ? (
            <DetailRow label="Keterlambatan" value={`Terlambat ${data.lateMinutes} menit`} />
          ) : null}
        </dl>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/app/student/history"
            className="inline-flex w-full items-center justify-center rounded-radius-md bg-school-blue-700 px-4 py-2.5 text-label-md text-white hover:bg-school-blue-900"
          >
            Lihat riwayat
          </Link>
          <Link
            to="/app/student"
            className="inline-flex w-full items-center justify-center rounded-radius-md border border-line-200 bg-surface-0 px-4 py-2.5 text-label-md font-semibold text-school-blue-700 hover:bg-surface-50"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    )
  }

  const config = scanErrorPanel(result.error, sessionItem)
  const Icon = TONE_ICONS[config.tone] ?? AlertTriangle
  const toneClass = {
    danger: 'text-danger-700',
    warning: 'text-warning-700',
    info: 'text-school-blue-700',
    neutral: 'text-ink-700',
  }[config.tone]

  return (
    <div
      role="alert"
      className="mx-auto w-full max-w-md rounded-radius-md border border-line-200 bg-surface-0 p-6 text-center shadow-1"
    >
      <Icon className={`mx-auto h-10 w-10 ${toneClass}`} aria-hidden="true" />
      <h2 className="mt-3 text-heading-md font-bold text-ink-900">
        {config.title}
      </h2>
      <p className="mt-1 text-body-md text-ink-700">{config.message}</p>

      <div className="mt-6 flex flex-col gap-2">
        {config.retry ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={isPending}
            className="inline-flex w-full items-center justify-center rounded-radius-md bg-school-blue-700 px-4 py-2.5 text-label-md text-white hover:bg-school-blue-900 disabled:opacity-60"
          >
            {isPending ? 'Memproses…' : 'Coba lagi'}
          </button>
        ) : null}
        {config.manual ? (
          <button
            type="button"
            onClick={onManual}
            disabled={isPending}
            className="inline-flex w-full items-center justify-center rounded-radius-md border border-line-200 bg-surface-0 px-4 py-2.5 text-label-md font-semibold text-school-blue-700 hover:bg-surface-50 disabled:opacity-60"
          >
            Masukkan kode manual
          </button>
        ) : null}
        {config.home ? (
          <Link
            to="/app/student"
            className="inline-flex w-full items-center justify-center rounded-radius-md border border-line-200 bg-surface-0 px-4 py-2.5 text-label-md font-semibold text-school-blue-700 hover:bg-surface-50"
          >
            Kembali ke beranda
          </Link>
        ) : null}
      </div>
    </div>
  )
}