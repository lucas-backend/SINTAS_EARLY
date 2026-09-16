import { StatusBadge } from '../../components/common/StatusBadge'
import {
  attendanceStatusLabel,
  attendanceStatusTone,
} from '../../lib/attendanceStatus'
import { formatSchoolDate, formatSchoolTime } from '../../lib/dateTime'

export function HistoryMobileList({ items, onSelect }) {
  return (
    <ul className="space-y-3 sm:hidden">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="w-full rounded-radius-md border border-line-200 bg-surface-0 p-4 text-left shadow-1 hover:bg-surface-50"
          >
            <span className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-data text-ink-900">
                  {formatSchoolDate(item.sessionDate)}
                </span>
                <span className="mt-0.5 block text-caption text-ink-700">
                  {item.scannedAt
                    ? `Scan ${formatSchoolTime(item.scannedAt)}`
                    : 'Tidak tercatat'}
                </span>
                <span className="mt-1 block text-body-md text-ink-700">
                  {item.subjectName ?? '—'}
                  {item.className ? ` • ${item.className}` : ''}
                </span>
                {item.status === 'TERLAMBAT' ? (
                  <span className="mt-1 block text-caption text-warning-700">
                    Terlambat {item.lateMinutes} menit
                  </span>
                ) : null}
              </span>
              <StatusBadge
                status={item.status}
                label={attendanceStatusLabel(item.status)}
                tone={attendanceStatusTone(item.status)}
              />
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function HistoryDesktopTable({ items, onSelect }) {
  return (
    <div className="hidden overflow-x-auto rounded-radius-md border border-line-200 bg-surface-0 shadow-1 sm:block">
      <table className="w-full text-left text-body-md">
        <caption className="sr-only">Riwayat absensi pribadi</caption>
        <thead className="bg-surface-50 text-caption uppercase tracking-wide text-ink-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Tanggal sesi</th>
            <th scope="col" className="px-4 py-3 font-semibold">Jam scan</th>
            <th scope="col" className="px-4 py-3 font-semibold">Mata pelajaran / Kelas</th>
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
            <th scope="col" className="px-4 py-3 font-semibold">Menit terlambat</th>
            <th scope="col" className="sr-only px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-surface-50">
              <td className="px-4 py-3 text-data text-ink-900">
                {formatSchoolDate(item.sessionDate)}
              </td>
              <td className="px-4 py-3 text-ink-700">
                {item.scannedAt ? formatSchoolTime(item.scannedAt) : '—'}
              </td>
              <td className="px-4 py-3">
                <span className="block font-semibold text-ink-900">
                  {item.subjectName ?? '—'}
                </span>
                <span className="block text-caption text-ink-700">
                  {item.className ?? ''}
                </span>
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
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="rounded-radius-sm px-2 py-1 text-label-md font-semibold text-school-blue-700 hover:bg-school-blue-050 focus-visible:outline-school-blue-700"
                >
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}