import { ProfileForm } from '../../features/profile/ProfileForm'
import { ROLES, roleLabel } from '../../lib/permissions'
import { useSessionStore } from '../../stores/sessionStore'

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <dt className="text-caption text-ink-500">{label}</dt>
      <dd className="text-data text-ink-900">{value || '—'}</dd>
    </div>
  )
}

export default function ProfilePage() {
  const user = useSessionStore((state) => state.user)
  if (!user) return null

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-heading-lg text-ink-900">Profil</h1>
        <p className="mt-1 text-body-md text-ink-700">
          Data berikut dikelola oleh sekolah. Username dan NIM tidak dapat diubah.
        </p>
      </div>

      <div className="rounded-radius-md border border-line-200 bg-surface-0 p-6 shadow-1">
        <h2 className="text-heading-sm text-ink-900">Identitas</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReadOnlyField label="Username" value={user.username} />
          {user.role === ROLES.STUDENT ? (
            <ReadOnlyField label="NIM" value={user.studentNumber} />
          ) : null}
          <ReadOnlyField label="Peran" value={roleLabel(user.role)} />
        </dl>
      </div>

      <div className="rounded-radius-md border border-line-200 bg-surface-0 p-6 shadow-1">
        <h2 className="text-heading-sm text-ink-900">Data profil</h2>
        <p className="mt-1 text-body-md text-ink-700">
          Perubahan hanya berlaku pada akun Anda dan disimpan oleh server.
        </p>
        <div className="mt-4">
          <ProfileForm user={user} />
        </div>
      </div>
    </section>
  )
}