import { KeyRound } from 'lucide-react'
import { roleLabel } from '../../../lib/permissions'
import { StatusBadge } from '../../../components/common/StatusBadge'

const ROLE_TONE = {
  ADMIN: 'info',
  TEACHER: 'warning',
  STUDENT: 'neutral',
}

export function UserMobileList({ items, onResetPassword }) {
  return (
    <ul className="space-y-3 sm:hidden">
      {items.map((user) => (
        <li key={user.id}>
          <div className="rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1">
            <span className="flex items-start justify-between gap-3">
              <span>
                <span className="block font-semibold text-ink-900">{user.name}</span>
                <span className="mt-0.5 block text-caption text-ink-700">@{user.username}</span>
              </span>
              <StatusBadge status={roleLabel(user.role)} tone={ROLE_TONE[user.role]} />
            </span>
            <span className="mt-1 block text-caption text-ink-700">
              {user.studentNumber ? `NISN ${user.studentNumber}` : user.email ?? 'Tanpa email'}
            </span>
            <button
              type="button"
              onClick={() => onResetPassword(user)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-radius-sm px-2 py-1 text-label-md font-semibold text-school-blue-700 hover:bg-school-blue-050"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Reset password
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function UserDesktopTable({ items, onResetPassword }) {
  return (
    <div className="hidden overflow-x-auto rounded-radius-md border border-line-200 bg-surface-0 shadow-1 sm:block">
      <table className="w-full text-left text-body-md">
        <caption className="sr-only">Daftar pengguna</caption>
        <thead className="bg-surface-50 text-caption uppercase tracking-wide text-ink-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Nama</th>
            <th scope="col" className="px-4 py-3 font-semibold">Username</th>
            <th scope="col" className="px-4 py-3 font-semibold">Peran</th>
            <th scope="col" className="px-4 py-3 font-semibold">NISN / Email</th>
            <th scope="col" className="sr-only px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-200">
          {items.map((user) => (
            <tr key={user.id} className="hover:bg-surface-50">
              <td className="px-4 py-3 font-semibold text-ink-900">{user.name}</td>
              <td className="px-4 py-3 text-ink-700">@{user.username}</td>
              <td className="px-4 py-3">
                <StatusBadge status={roleLabel(user.role)} tone={ROLE_TONE[user.role]} />
              </td>
              <td className="px-4 py-3 text-ink-700">
                {user.studentNumber ? `NISN ${user.studentNumber}` : user.email ?? '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onResetPassword(user)}
                  className="inline-flex items-center gap-1.5 rounded-radius-sm px-2 py-1 text-label-md font-semibold text-school-blue-700 hover:bg-school-blue-050 focus-visible:outline-school-blue-700"
                >
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                  Reset password
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}