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

export function MembershipsTable({ items }) {
  return (
    <div className="overflow-x-auto rounded-radius-md border border-line-200 bg-surface-0 shadow-1">
      <table className="w-full text-left text-body-md">
        <caption className="sr-only">Penempatan siswa</caption>
        <thead className="bg-surface-50 text-caption uppercase tracking-wide text-ink-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Kelas</th>
            <th scope="col" className="px-4 py-3 font-semibold">Siswa</th>
            <th scope="col" className="px-4 py-3 font-semibold">NISN</th>
            <th scope="col" className="px-4 py-3 font-semibold">Sejak</th>
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-200">
          {items.map((membership) => (
            <tr key={membership.id} className="hover:bg-surface-50">
              <td className="px-4 py-3 font-semibold text-ink-900">
                {membership.class?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-ink-900">{membership.student?.name ?? '—'}</td>
              <td className="px-4 py-3 text-ink-700">
                {membership.student?.studentNumber ?? '—'}
              </td>
              <td className="px-4 py-3 text-ink-700">
                {formatSchoolDate(membership.createdAt)}
              </td>
              <td className="px-4 py-3">
                <MembershipStatus isActive={membership.isActive} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AssignmentsManageTable({ items }) {
  return (
    <div className="overflow-x-auto rounded-radius-md border border-line-200 bg-surface-0 shadow-1">
      <table className="w-full text-left text-body-md">
        <caption className="sr-only">Penugasan guru</caption>
        <thead className="bg-surface-50 text-caption uppercase tracking-wide text-ink-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Kelas</th>
            <th scope="col" className="px-4 py-3 font-semibold">Mata pelajaran</th>
            <th scope="col" className="px-4 py-3 font-semibold">Guru</th>
            <th scope="col" className="px-4 py-3 font-semibold">Sejak</th>
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-200">
          {items.map((assignment) => (
            <tr key={assignment.id} className="hover:bg-surface-50">
              <td className="px-4 py-3 font-semibold text-ink-900">
                {assignment.class?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-ink-900">
                {assignment.subject?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-ink-700">
                {assignment.teacher?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-ink-700">
                {formatSchoolDate(assignment.createdAt)}
              </td>
              <td className="px-4 py-3">
                <MembershipStatus isActive={assignment.isActive} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}