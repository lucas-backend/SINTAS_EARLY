import { Link } from 'react-router-dom'
import { formatSchoolDate, formatSchoolTime } from '../../lib/dateTime'

function Actions({ session }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/app/teacher/sessions/${session.id}/qr`}
        className="rounded-radius-sm px-2 py-1 text-label-md font-semibold text-school-blue-700 hover:bg-school-blue-050 focus-visible:outline-school-blue-700"
      >
        Lihat QR
      </Link>
      <Link
        to={`/app/teacher/classes/${session.classId}/attendance`}
        className="rounded-radius-sm px-2 py-1 text-label-md font-semibold text-school-blue-700 hover:bg-school-blue-050 focus-visible:outline-school-blue-700"
      >
        Kehadiran
      </Link>
    </div>
  )
}

export function SessionMobileList({ items }) {
  return (
    <ul className="space-y-3 sm:hidden">
      {items.map((session) => (
        <li
          key={session.id}
          className="rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1"
        >
          <p className="text-data text-ink-900">
            {formatSchoolDate(session.sessionDate)}
          </p>
          <p className="mt-1 text-body-md text-ink-700">
            {formatSchoolTime(session.startAt)}–{formatSchoolTime(session.endAt)}
          </p>
          <p className="mt-1 font-semibold text-ink-900">{session.subjectName ?? '—'}</p>
          <p className="text-caption text-ink-700">{session.className ?? ''}</p>
          <div className="mt-3">
            <Actions session={session} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function SessionDesktopTable({ items }) {
  return (
    <div className="hidden overflow-x-auto rounded-radius-md border border-line-200 bg-surface-0 shadow-1 sm:block">
      <table className="w-full text-left text-body-md">
        <caption className="sr-only">Daftar sesi absensi yang Anda buat</caption>
        <thead className="bg-surface-50 text-caption uppercase tracking-wide text-ink-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Tanggal sesi</th>
            <th scope="col" className="px-4 py-3 font-semibold">Waktu</th>
            <th scope="col" className="px-4 py-3 font-semibold">Mata pelajaran / Kelas</th>
            <th scope="col" className="px-4 py-3 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-200">
          {items.map((session) => (
            <tr key={session.id} className="hover:bg-surface-50">
              <td className="px-4 py-3 text-data text-ink-900">
                {formatSchoolDate(session.sessionDate)}
              </td>
              <td className="px-4 py-3 text-ink-700">
                {formatSchoolTime(session.startAt)}–{formatSchoolTime(session.endAt)}
              </td>
              <td className="px-4 py-3">
                <span className="block font-semibold text-ink-900">
                  {session.subjectName ?? '—'}
                </span>
                <span className="block text-caption text-ink-700">
                  {session.className ?? ''}
                </span>
              </td>
              <td className="px-4 py-3">
                <Actions session={session} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
