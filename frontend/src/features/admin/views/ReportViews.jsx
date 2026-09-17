import { StatusBadge } from '../../../components/common/StatusBadge'
import {
  attendanceStatusLabel,
  attendanceStatusTone,
} from '../../../lib/attendanceStatus'
import { formatSchoolDate, formatSchoolTime } from '../../../lib/dateTime'

export function ReportMobileList({ items }) {
  return (
    <ul className="space-y-3 sm:hidden">
      {items.map((item) => (
        <li key={item.id}>
          <div className="rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1">
            <span className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-data text-ink-900">
                  {formatSchoolDate(item.sessionDate)}
                </span>
                <span className="mt-0.5 block text-caption text-ink-700">
                  {item.className ?? '—'} • {item.subjectName ?? '—'}
                </span>
              </span>
              <StatusBadge
                status={item.status}
                label={attendanceStatusLabel(item.status)}
                tone={attendanceStatusTone(item.status)}
              />
            </span>
            <span className="mt-1 block text-body-md text-ink-900">{item.studentName}</span>
            <span className="mt-0.5 block text-caption text-ink-700">
              {item.studentNumber ? `NISN ${item.studentNumber}` : ''}
              {item.scannedAt ? ` • Scan ${formatSchoolTime(item.scannedAt)}` : ''}
              {item.status === 'TERLAMBAT' ? ` • Terlambat ${item.lateMinutes} menit` : ''}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ReportDesktopTable({ items }) {
  return (
    <div className="hidden overflow-x-auto rounded-radius-md border border-line-200 bg-surface-0 shadow-1 sm:block">
      <table className="w-full text-left text-body-md">
        <caption className="sr-only">Laporan kehadiran global</caption>
        <thead className="bg-surface-50 text-caption uppercase tracking-wide text-ink-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Tanggal sesi</th>
            <th scope="col" className="px-4 py-3 font-semibold">Kelas</th>
            <th scope="col" className="px-4 py-3 font-semibold">Mata pelajaran</th>
            <th scope="col" className="px-4 py-3 font-semibold">Siswa</th>
            <th scope="col" className="px-4 py-3 font-semibold">Jam scan</th>
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
            <th scope="col" className="px-4 py-3 font-semibold">Terlambat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-surface-50">
              <td className="px-4 py-3 text-data text-ink-900">
                {formatSchoolDate(item.sessionDate)}
              </td>
              <td className="px-4 py-3 font-semibold text-ink-900">{item.className ?? '—'}</td>
              <td className="px-4 py-3 text-ink-700">{item.subjectName ?? '—'}</td>
              <td className="px-4 py-3 text-ink-900">{item.studentName}</td>
              <td className="px-4 py-3 text-ink-700">
                {item.scannedAt ? formatSchoolTime(item.scannedAt) : '—'}
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  status={item.status}
                  label={attendanceStatusLabel(item.status)}
                  tone={attendanceStatusTone(item.status)}
                />
              </td>
              <td className="px-4 py-3 text-data text-ink-700">
                {item.status === 'TERLAMBAT' ? `${item.lateMinutes} menit` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}