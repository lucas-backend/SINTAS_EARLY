import { StatusBadge } from '../../components/common/StatusBadge'
import {
  attendanceStatusLabel,
  attendanceStatusTone,
} from '../../lib/attendanceStatus'
import { formatSchoolDate, formatSchoolTime } from '../../lib/dateTime'

function LateMinutes({ item }) {
  if (item.status !== 'TERLAMBAT') return <span className="text-ink-500">—</span>
  return <span className="text-data text-warning-700">{item.lateMinutes} menit</span>
}

export function ClassAttendanceMobileList({ items }) {
  return (
    <ul className="space-y-3 sm:hidden">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-data text-ink-900">{item.studentName}</p>
              <p className="text-caption text-ink-700">
                {item.studentNumber ? `NIM ${item.studentNumber}` : 'NIM —'}
              </p>
              <p className="mt-1 text-body-md text-ink-700">
                {item.subjectName ?? '—'}
                {item.className ? ` • ${item.className}` : ''}
              </p>
              <p className="mt-1 text-caption text-ink-500">
                {formatSchoolDate(item.sessionDate)}
                {item.scannedAt ? ` • scan ${formatSchoolTime(item.scannedAt)}` : ''}
              </p>
            </div>
            <StatusBadge
              status={item.status}
              label={attendanceStatusLabel(item.status)}
              tone={attendanceStatusTone(item.status)}
            />
          </div>
          <p className="mt-2 text-caption text-ink-700">
            Menit terlambat: <LateMinutes item={item} />
          </p>
        </li>
      ))}
    </ul>
  )
}

export function ClassAttendanceDesktopTable({ items }) {
  return (
    <div className="hidden overflow-x-auto rounded-radius-md border border-line-200 bg-surface-0 shadow-1 sm:block">
      <table className="w-full text-left text-body-md">
        <caption className="sr-only">Detail kehadiran siswa pada kelas ini</caption>
        <thead className="bg-surface-50 text-caption uppercase tracking-wide text-ink-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Tanggal sesi</th>
            <th scope="col" className="px-4 py-3 font-semibold">Jam scan</th>
            <th scope="col" className="px-4 py-3 font-semibold">Siswa</th>
            <th scope="col" className="px-4 py-3 font-semibold">Mata pelajaran</th>
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
            <th scope="col" className="px-4 py-3 font-semibold">Menit terlambat</th>
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
                  {item.studentName}
                </span>
                <span className="block text-caption text-ink-700">
                  {item.studentNumber ? `NIM ${item.studentNumber}` : 'NIM —'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="block text-ink-900">{item.subjectName ?? '—'}</span>
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
              <td className="px-4 py-3">
                <LateMinutes item={item} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
