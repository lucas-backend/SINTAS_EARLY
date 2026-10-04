import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { useState } from 'react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SectionState } from '../../components/feedback/SectionState'
import { Skeleton } from '../../components/common/Skeleton'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useIsOnline } from '../../hooks/useIsOnline'
import { getErrorMessage } from '../../lib/errorMapping'
import {
  attendanceStatusLabel,
  attendanceStatusTone,
  MANUAL_STATUS_OPTIONS,
} from '../../lib/attendanceStatus'
import { todaySchoolDate } from '../../lib/dateTime'
import { useDailyRecap } from '../../features/teacher/hooks/useDailyRecap'
import { useRecapSummary } from '../../features/teacher/hooks/useRecapSummary'
import { useSetManualAttendanceStatus } from '../../features/teacher/hooks/useSetManualAttendanceStatus'
import { useExportReport } from '../../features/teacher/hooks/useExportReport'

const TABS = Object.freeze({
  DAILY: 'daily',
  SUMMARY: 'summary',
})

const STAT_ITEMS = [
  { key: 'h', label: 'Hadir' },
  { key: 'izin', label: 'Izin' },
  { key: 'sakit', label: 'Sakit' },
  { key: 'alfa', label: 'Alfa' },
  { key: 'dispen', label: 'Dispen' },
  { key: 'tidakHadir', label: 'Tidak Hadir' },
]

function StatGrid({ summary }) {
  return (
    <dl className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {STAT_ITEMS.map((item) => (
        <div
          key={item.key}
          className="rounded-lg border border-black/10 bg-white p-3 text-center"
        >
          <dt className="text-xs text-slate-700">{item.label}</dt>
          <dd className="text-xl font-bold text-ink-900">
            {summary?.[item.key] ?? 0}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function ManualStatusControl({ row, onSet, isPending }) {
  const [value, setValue] = useState('')

  const handleChange = (event) => {
    const next = event.target.value
    setValue(next)
    if (next) onSet({ sessionId: row.sessionId, studentId: row.studentId, status: next })
  }

  return (
    <label className="flex items-center gap-2 text-xs text-slate-700">
      <span className="sr-only">Set status manual</span>
      <select
        value={value}
        disabled={isPending}
        onChange={handleChange}
        className="rounded-lg border border-black/10 bg-white px-2 py-1 text-sm text-ink-900 disabled:opacity-50"
      >
        <option value="">Set status…</option>
        {MANUAL_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function DailyRecap({ online }) {
  const [date, setDate] = useState(todaySchoolDate())
  const recap = useDailyRecap({ date })
  const mutation = useSetManualAttendanceStatus()
  const data = recap.data
  const absent = data?.absent ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">
          Tanggal
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 block rounded-lg border border-black/10 bg-white px-4 py-2 text-ink-900"
          />
        </label>
      </div>

      {mutation.isError ? (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
          {getErrorMessage(mutation.error)}
        </p>
      ) : null}

      <SectionState
        query={recap}
        online={online}
        isEmpty={absent.length === 0}
        empty={
          <EmptyState
            title="Tidak ada siswa tidak masuk"
            message="Semua siswa tercatat hadir pada tanggal ini, atau belum ada sesi."
          />
        }
        skeleton={<Skeleton className="h-40 w-full rounded-lg" />}
        errorTitle="Rekap harian tidak dapat dimuat."
      >
        <StatGrid summary={data?.summary} />
        <ul className="mt-4 space-y-3">
          {absent.map((row) => (
            <li
              key={`${row.sessionId}-${row.studentId}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-900">
                  {row.studentName}
                </p>
                <p className="text-xs text-slate-700">
                  {row.className} · {row.subjectName}
                  {row.studentNumber ? ` · ${row.studentNumber}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge
                  status={row.status}
                  label={attendanceStatusLabel(row.status)}
                  tone={attendanceStatusTone(row.status)}
                />
                <ManualStatusControl
                  row={row}
                  onSet={mutation.mutate}
                  isPending={mutation.isPending}
                />
              </div>
            </li>
          ))}
        </ul>
      </SectionState>
    </div>
  )
}

function OverallRecap({ online }) {
  const summary = useRecapSummary()
  const items = summary.data?.items ?? []

  return (
    <SectionState
      query={summary}
      online={online}
      isEmpty={items.length === 0}
      empty={
        <EmptyState
          title="Belum ada data rekap"
          message="Rekap muncul setelah ada sesi absensi dalam penugasan Anda."
        />
      }
      skeleton={<Skeleton className="h-40 w-full rounded-lg" />}
      errorTitle="Rekap keseluruhan tidak dapat dimuat."
    >
      <StatGrid summary={summary.data?.summary} />
      <div className="mt-4 overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Rekap kehadiran keseluruhan per siswa (H.I.S.A.D)
          </caption>
          <thead className="border-b border-black/10 text-slate-700">
            <tr>
              <th scope="col" className="p-3 font-semibold">Nama siswa</th>
              <th scope="col" className="p-3 font-semibold">NIM</th>
              <th scope="col" className="p-3 font-semibold">Kelas</th>
              <th scope="col" className="p-3 font-semibold">Pertemuan</th>
              <th scope="col" className="p-3 font-semibold">H</th>
              <th scope="col" className="p-3 font-semibold">I</th>
              <th scope="col" className="p-3 font-semibold">S</th>
              <th scope="col" className="p-3 font-semibold">A</th>
              <th scope="col" className="p-3 font-semibold">D</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr
                key={row.studentId}
                className="border-b border-black/5 last:border-b-0"
              >
                <td className="p-3 font-semibold text-ink-900">{row.studentName}</td>
                <td className="p-3 text-slate-700">{row.studentNumber ?? '—'}</td>
                <td className="p-3 text-slate-700">{row.className ?? '—'}</td>
                <td className="p-3 text-slate-700">{row.totalMeetings}</td>
                <td className="p-3 text-slate-700">{row.h}</td>
                <td className="p-3 text-slate-700">{row.izin}</td>
                <td className="p-3 text-slate-700">{row.sakit}</td>
                <td className="p-3 text-slate-700">{row.alfa}</td>
                <td className="p-3 text-slate-700">{row.dispen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionState>
  )
}

// Halaman Rekap guru (D24/R5): rekap harian (siapa tidak masuk + input manual
// Izin/Sakit/Alfa/Dispen) dan rekap keseluruhan per siswa (H.I.S.A.D).
export default function TeacherRecapsPage() {
  const online = useIsOnline()
  const [tab, setTab] = useState(TABS.DAILY)
  const exporter = useExportReport()

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink-900">
            <InsightsRoundedIcon className="h-6! w-6! text-blue-500" aria-hidden="true" />
            Rekap absensi
          </h1>
          <p className="mt-1 text-sm text-slate-700">
            Rekap harian dan rekap keseluruhan siswa dalam penugasan Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => exporter.mutate({})}
          disabled={exporter.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white uppercase disabled:opacity-50"
        >
          <DownloadRoundedIcon className="h-4! w-4!" aria-hidden="true" />
          {exporter.isPending ? 'Menyiapkan…' : 'Export XLSX'}
        </button>
      </div>

      {exporter.isError ? (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
          {getErrorMessage(exporter.error)}
        </p>
      ) : null}

      <div
        role="tablist"
        aria-label="Jenis rekap"
        className="flex gap-2 rounded-lg border border-black/10 bg-white p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === TABS.DAILY}
          onClick={() => setTab(TABS.DAILY)}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${
            tab === TABS.DAILY ? 'bg-blue-500 text-white' : 'text-slate-700'
          }`}
        >
          Harian
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === TABS.SUMMARY}
          onClick={() => setTab(TABS.SUMMARY)}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${
            tab === TABS.SUMMARY ? 'bg-blue-500 text-white' : 'text-slate-700'
          }`}
        >
          Keseluruhan
        </button>
      </div>

      {tab === TABS.DAILY ? (
        <DailyRecap online={online} />
      ) : (
        <OverallRecap online={online} />
      )}
    </section>
  )
}
