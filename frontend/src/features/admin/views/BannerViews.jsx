import { formatSchoolDateTime } from '../../../lib/dateTime'
import { StatusBadge } from '../../../components/common/StatusBadge'

function BannerPeriod({ banner }) {
  const start = formatSchoolDateTime(banner.displayStartAt)
  const end = formatSchoolDateTime(banner.displayEndAt)
  if (!start && !end) return 'Selalu'
  if (start && end) return `${start} — ${end}`
  return `${start || 'sekarang'} — ${end || 'selesai'}`
}

export function BannerMobileList({ items, onEdit, onDelete }) {
  return (
    <ul className="space-y-3 sm:hidden">
      {items.map((banner) => (
        <li key={banner.id}>
          <div className="rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1">
            <span className="flex items-start justify-between gap-3">
              <span className="block font-semibold text-ink-900">{banner.title}</span>
              <StatusBadge
                status={banner.isActive ? 'Aktif' : 'Nonaktif'}
                tone={banner.isActive ? 'success' : 'neutral'}
              />
            </span>
            <span className="mt-1 block text-caption text-ink-700">
              {banner.content && !banner.imageUrl ? banner.content : banner.imageUrl ?? 'Tanpa konten'}
            </span>
            <span className="mt-1 block text-caption text-ink-700">
              Tampil: <BannerPeriod banner={banner} />
            </span>
            <span className="mt-2 block">
              <button
                type="button"
                onClick={() => onEdit(banner)}
                className="rounded-radius-sm px-2 py-1 text-label-md font-semibold text-school-blue-700 hover:bg-school-blue-050"
              >
                Ubah
              </button>
              <button
                type="button"
                onClick={() => onDelete(banner)}
                className="rounded-radius-sm px-2 py-1 text-label-md font-semibold text-danger-700 hover:bg-danger-700/10"
              >
                Hapus
              </button>
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function BannerDesktopTable({ items, onEdit, onDelete }) {
  return (
    <div className="hidden overflow-x-auto rounded-radius-md border border-line-200 bg-surface-0 shadow-1 sm:block">
      <table className="w-full text-left text-body-md">
        <caption className="sr-only">Daftar banner sekolah</caption>
        <thead className="bg-surface-50 text-caption uppercase tracking-wide text-ink-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Judul</th>
            <th scope="col" className="px-4 py-3 font-semibold">Konten</th>
            <th scope="col" className="px-4 py-3 font-semibold">Periode tampil</th>
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
            <th scope="col" className="sr-only px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-200">
          {items.map((banner) => (
            <tr key={banner.id} className="hover:bg-surface-50">
              <td className="px-4 py-3 font-semibold text-ink-900">{banner.title}</td>
              <td className="max-w-xs px-4 py-3 text-ink-700">
                <span className="block truncate">
                  {banner.content && !banner.imageUrl ? banner.content : banner.imageUrl ?? '—'}
                </span>
              </td>
              <td className="px-4 py-3 text-ink-700">
                <BannerPeriod banner={banner} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  status={banner.isActive ? 'Aktif' : 'Nonaktif'}
                  tone={banner.isActive ? 'success' : 'neutral'}
                />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(banner)}
                    className="rounded-radius-sm px-2 py-1 text-label-md font-semibold text-school-blue-700 hover:bg-school-blue-050 focus-visible:outline-school-blue-700"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(banner)}
                    className="rounded-radius-sm px-2 py-1 text-label-md font-semibold text-danger-700 hover:bg-danger-700/10 focus-visible:outline-danger-700"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}