import { ArrowLeft, CalendarDays, Clock, QrCode } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SectionState } from '../../components/feedback/SectionState'
import { Skeleton } from '../../components/common/Skeleton'
import { QrDisplay } from '../../features/teacher/QrDisplay'
import { useSessionQr } from '../../features/teacher/hooks/useSessionQr'
import { useIsOnline } from '../../hooks/useIsOnline'
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

export default function TeacherSessionQrPage() {
  const online = useIsOnline()
  const { sessionId } = useParams()
  const id = Number(sessionId)
  const qrQuery = useSessionQr(id)
  const session = qrQuery.data

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          to="/app/teacher/sessions"
          className="inline-flex items-center gap-1.5 rounded-radius-sm text-label-md font-semibold text-school-blue-700 focus-visible:outline-school-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke daftar sesi
        </Link>
        <h1 className="mt-3 text-heading-lg font-bold text-ink-900">QR sesi absensi</h1>
        <p className="mt-1 text-body-md text-ink-700">
          Tampilkan QR Code ini di kelas. Siswa memindai untuk mencatat kehadiran
          selama jendela absensi.
        </p>
      </div>

      <SectionState
        query={qrQuery}
        online={online}
        empty={
          <EmptyState
            title="Sesi tidak ditemukan"
            message="Sesi mungkin sudah tidak tersedia atau bukan milik Anda."
          />
        }
        skeleton={
          <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
            <Skeleton className="h-72 w-72" />
            <Skeleton className="h-56 w-full" />
          </div>
        }
        errorTitle="QR sesi tidak dapat dimuat."
      >
        {session ? (
          <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
            <QrDisplay
              payload={session.qrPayload}
              title={`QR ${session.subjectName ?? 'sesi'} ${session.className ?? ''}`.trim()}
            />
            <div className="space-y-4 rounded-radius-md border border-line-200 bg-surface-0 p-5 shadow-1">
              <DetailRow icon={QrCode} label="Mata pelajaran" value={session.subjectName ?? '—'} />
              <DetailRow icon={CalendarDays} label="Kelas" value={session.className ?? '—'} />
              <DetailRow
                icon={CalendarDays}
                label="Tanggal sesi"
                value={formatSchoolDate(session.sessionDate)}
              />
              <DetailRow
                icon={Clock}
                label="Jendela absensi"
                value={`${formatSchoolTime(session.startAt)}–${formatSchoolTime(session.endAt)}`}
              />
              <p className="rounded-radius-sm bg-school-blue-050 p-3 text-body-md text-ink-900">
                Dibuka 15 menit sebelum jam mulai hingga jam selesai. Status
                kehadiran dan keterlambatan dihitung server saat pemindaian.
              </p>
              <Link
                to={`/app/teacher/classes/${session.classId}/attendance`}
                className="inline-flex items-center justify-center rounded-radius-md border border-line-200 bg-surface-0 px-4 py-2.5 text-label-md font-semibold text-school-blue-700 hover:bg-surface-50"
              >
                Lihat detail kehadiran kelas
              </Link>
            </div>
          </div>
        ) : null}
      </SectionState>
    </section>
  )
}
