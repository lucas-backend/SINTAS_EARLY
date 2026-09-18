import { BookOpen, CalendarDays, Clock, GraduationCap, QrCode } from 'lucide-react'
import { StatusBadge } from '../../components/common/StatusBadge'
import {
  windowStatusLabel,
  windowStatusTone,
} from '../../lib/attendanceStatus'
import { formatSchoolDate, formatSchoolTime } from '../../lib/dateTime'

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 text-body-md text-ink-700">
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" /> : null}
      <span>
        <span className="block text-caption text-ink-500">{label}</span>
        <span className="block text-data text-ink-900">{value}</span>
      </span>
    </div>
  )
}

// Pre-check sebelum kamera diminta (docs/DESIGN_BRIEF.md 4.2): detail sesi,
// jendela absensi, dan CTA memulai scan. Status window tetap dari server.
export function ScanPrecheck({ sessionItem, missed = false, onBegin, onManual }) {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {sessionItem ? (
        <div className="rounded-radius-md border border-line-200 bg-surface-0 p-5 shadow-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-heading-sm font-bold text-ink-900">
                {sessionItem.subjectName}
              </h2>
              <p className="mt-0.5 text-caption text-ink-700">{sessionItem.className}</p>
            </div>
            <StatusBadge
              status={sessionItem.windowStatus}
              label={windowStatusLabel(sessionItem.windowStatus)}
              tone={windowStatusTone(sessionItem.windowStatus)}
            />
          </div>
          <dl className="mt-4 space-y-3">
            <DetailRow icon={BookOpen} label="Mata pelajaran" value={sessionItem.subjectName} />
            <DetailRow icon={GraduationCap} label="Guru" value={sessionItem.teacherName} />
            <DetailRow icon={CalendarDays} label="Tanggal" value={formatSchoolDate(sessionItem.sessionDate)} />
            <DetailRow
              icon={Clock}
              label="Jendela absensi"
              value={`${formatSchoolTime(sessionItem.startAt)}–${formatSchoolTime(sessionItem.endAt)}`}
            />
          </dl>
          <p className="mt-4 rounded-radius-sm bg-school-blue-050 p-3 text-body-md text-ink-900">
            Dibuka 15 menit sebelum jam mulai hingga jam selesai. Status kehadiran
            dan keterlambatan dihitung server saat pemindaian.
          </p>
          {sessionItem.windowStatus === 'BELUM_DIBUKA' ? (
            <p className="mt-3 text-body-md text-ink-700">
              Sesi belum dibuka. Scan dapat dilakukan setelah pukul{' '}
              {formatSchoolTime(sessionItem.startAt)}.
            </p>
          ) : null}
          {sessionItem.windowStatus === 'SELESAI' ? (
            <p className="mt-3 text-body-md text-ink-700">
              Sesi sudah selesai. Scan telat tidak mencatat kehadiran.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="rounded-radius-md border border-line-200 bg-surface-0 p-5 text-center shadow-1">
          {missed ? (
            <p className="mb-3 rounded-radius-sm bg-surface-50 p-3 text-body-md text-ink-700">
              Sesi ini tidak ada pada jadwal hari ini. Anda tetap dapat memindai;
              status ditentukan server.
            </p>
          ) : null}
          <QrCode className="mx-auto h-10 w-10 text-school-blue-700" aria-hidden="true" />
          <h2 className="mt-3 text-heading-sm font-bold text-ink-900">
            Arahkan kamera ke QR Code
          </h2>
          <p className="mt-1 text-body-md text-ink-700">
            Temukan QR Code yang ditampilkan guru, lalu arahkan kamera ke kode
            tersebut.
          </p>
          <p className="mt-3 rounded-radius-sm bg-school-blue-050 p-3 text-body-md text-ink-900">
            Scan hanya aktif mulai 15 menit sebelum jam mulai hingga jam selesai.
            Status dan keterlambatan dihitung server.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onBegin}
        className="inline-flex w-full items-center justify-center rounded-radius-md bg-school-blue-700 px-4 py-3 text-label-md text-white hover:bg-school-blue-900"
      >
        Mulai memindai
      </button>
      <button
        type="button"
        onClick={onManual}
        className="inline-flex w-full items-center justify-center rounded-radius-md border border-line-200 bg-surface-0 px-4 py-2.5 text-label-md font-semibold text-school-blue-700 hover:bg-surface-50"
      >
        Masukkan kode manual
      </button>
    </div>
  )
}