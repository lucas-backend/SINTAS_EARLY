import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { formatSchoolDate, formatSchoolTime } from '../../../lib/dateTime'

function RowActions({ session, onEdit, onDelete }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(session)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-blue-500 hover:bg-blue-100/50"
      >
        <EditRoundedIcon className="h-4! w-4!" aria-hidden="true" />
        Ubah
      </button>
      <button
        type="button"
        onClick={() => onDelete(session)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-red-500 hover:bg-red-500/10"
      >
        <DeleteRoundedIcon className="h-4! w-4!" aria-hidden="true" />
        Hapus
      </button>
    </div>
  )
}

export function SessionMobileList({ items, onEdit, onDelete }) {
  return (
    <ul className="space-y-3 sm:hidden">
      {items.map((session) => (
        <li key={session.id}>
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <span className="flex items-start justify-between gap-3">
              <span className="font-semibold text-ink-900">{session.subjectName ?? '—'}</span>
              <span className="text-xs text-slate-700">{formatSchoolDate(session.sessionDate)}</span>
            </span>
            <span className="mt-1 block text-sm text-slate-700">{session.className ?? '—'}</span>
            <span className="mt-0.5 block text-xs text-slate-700">
              {formatSchoolTime(session.startAt)} – {formatSchoolTime(session.endAt)}
            </span>
            <div className="mt-2">
              <RowActions session={session} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function SessionDesktopTable({ items, onEdit, onDelete }) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-black/10 bg-white sm:block">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Daftar sesi absensi</caption>
        <thead className="border-b border-black/10 text-slate-700">
          <tr>
            <th scope="col" className="p-3 font-semibold">Tanggal</th>
            <th scope="col" className="p-3 font-semibold">Kelas</th>
            <th scope="col" className="p-3 font-semibold">Mata pelajaran</th>
            <th scope="col" className="p-3 font-semibold">Waktu</th>
            <th scope="col" className="sr-only p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((session) => (
            <tr key={session.id} className="border-b border-black/5 last:border-b-0">
              <td className="p-3 text-slate-700">{formatSchoolDate(session.sessionDate)}</td>
              <td className="p-3 font-semibold text-ink-900">{session.className ?? '—'}</td>
              <td className="p-3 text-ink-900">{session.subjectName ?? '—'}</td>
              <td className="p-3 text-slate-700">
                {formatSchoolTime(session.startAt)} – {formatSchoolTime(session.endAt)}
              </td>
              <td className="p-3 text-right">
                <RowActions session={session} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
