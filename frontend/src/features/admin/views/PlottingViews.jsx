import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded'
import { StatusBadge } from '../../../components/common/StatusBadge'
import { formatSchoolDate } from '../../../lib/dateTime'

function MembershipStatus({ isActive }) {
  return (
    <StatusBadge
      status={isActive ? 'Aktif' : 'Nonaktif'}
      tone={isActive ? 'success' : 'neutral'}
    />
  )
}

function RowActions({ item, onDelete, onActivate }) {
  if (item.isActive) {
    return (
      <button
        type="button"
        onClick={() => onDelete(item)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-red-500 hover:bg-red-500/10"
      >
        <DeleteRoundedIcon className="h-4! w-4!" aria-hidden="true" />
        Hapus
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={() => onActivate(item)}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-blue-500 hover:bg-blue-100/50"
    >
      <RestoreRoundedIcon className="h-4! w-4!" aria-hidden="true" />
      Aktifkan
    </button>
  )
}

export function MembershipsTable({ items, onDelete, onActivate }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Penempatan siswa</caption>
        <thead className="border-b border-black/10 text-slate-700">
          <tr>
            <th scope="col" className="p-3 font-semibold">Kelas</th>
            <th scope="col" className="p-3 font-semibold">Siswa</th>
            <th scope="col" className="p-3 font-semibold">NISN</th>
            <th scope="col" className="p-3 font-semibold">Sejak</th>
            <th scope="col" className="p-3 font-semibold">Status</th>
            <th scope="col" className="sr-only p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((membership) => (
            <tr key={membership.id} className="border-b border-black/5 last:border-b-0">
              <td className="p-3 font-semibold text-ink-900">
                {membership.class?.name ?? '—'}
              </td>
              <td className="p-3 text-ink-900">{membership.student?.name ?? '—'}</td>
              <td className="p-3 text-slate-700">
                {membership.student?.studentNumber ?? '—'}
              </td>
              <td className="p-3 text-slate-700">
                {formatSchoolDate(membership.createdAt)}
              </td>
              <td className="p-3">
                <MembershipStatus isActive={membership.isActive} />
              </td>
              <td className="p-3 text-right">
                <div className="flex justify-end">
                  <RowActions item={membership} onDelete={onDelete} onActivate={onActivate} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AssignmentsManageTable({ items, onDelete, onActivate }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Penugasan guru</caption>
        <thead className="border-b border-black/10 text-slate-700">
          <tr>
            <th scope="col" className="p-3 font-semibold">Kelas</th>
            <th scope="col" className="p-3 font-semibold">Mata pelajaran</th>
            <th scope="col" className="p-3 font-semibold">Guru</th>
            <th scope="col" className="p-3 font-semibold">Sejak</th>
            <th scope="col" className="p-3 font-semibold">Status</th>
            <th scope="col" className="sr-only p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((assignment) => (
            <tr key={assignment.id} className="border-b border-black/5 last:border-b-0">
              <td className="p-3 font-semibold text-ink-900">
                {assignment.class?.name ?? '—'}
              </td>
              <td className="p-3 text-ink-900">
                {assignment.subject?.name ?? '—'}
              </td>
              <td className="p-3 text-slate-700">
                {assignment.teacher?.name ?? '—'}
              </td>
              <td className="p-3 text-slate-700">
                {formatSchoolDate(assignment.createdAt)}
              </td>
              <td className="p-3">
                <MembershipStatus isActive={assignment.isActive} />
              </td>
              <td className="p-3 text-right">
                <div className="flex justify-end">
                  <RowActions item={assignment} onDelete={onDelete} onActivate={onActivate} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AddPlacementButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white"
    >
      <AddRoundedIcon className="h-4! w-4!" aria-hidden="true" />
      {label}
    </button>
  )
}
