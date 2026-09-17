import { AlertTriangle, Pencil, Plus } from 'lucide-react'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { SectionState } from '../../../components/feedback/SectionState'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'
import { Pagination } from '../../../components/common/Pagination'
import { Skeleton } from '../../../components/common/Skeleton'
import { useIsOnline } from '../../../hooks/useIsOnline'
import { useState } from 'react'

// Daftar master (jenjang, kelas, mata pelajaran) yang dipakai tab Akademik:
// satu pola untuk loading/empty/error/retry + pagination + ubah + hapus.
export function MasterList({
  title,
  subtitle,
  query,
  items,
  meta,
  page,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
  emptyTitle,
  emptyMessage,
  levelName = null,
}) {
  const online = useIsOnline()
  const [target, setTarget] = useState(null)
  const total = meta?.total ?? 0
  const totalPages = meta?.totalPages ?? 0

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-heading-sm font-bold text-ink-900">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-body-md text-ink-700">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-radius-md bg-school-blue-700 px-3 py-2 text-label-md text-white hover:bg-school-blue-900"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah
        </button>
      </div>

      <SectionState
        query={query}
        online={online}
        isEmpty={items.length === 0}
        empty={
          <EmptyState title={emptyTitle} message={emptyMessage} />
        }
        skeleton={
          <div className="space-y-2">
            {[0, 1, 2, 3].map((value) => (
              <Skeleton key={value} className="h-12 w-full" />
            ))}
          </div>
        }
        errorTitle={`${title} tidak dapat dimuat.`}
      >
        <div className="overflow-x-auto rounded-radius-md border border-line-200 bg-surface-0 shadow-1">
          <table className="w-full text-left text-body-md">
            <caption className="sr-only">{title}</caption>
            <thead className="bg-surface-50 text-caption uppercase tracking-wide text-ink-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Nama</th>
                {levelName ? (
                  <th scope="col" className="px-4 py-3 font-semibold">Jenjang</th>
                ) : null}
                <th scope="col" className="sr-only px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-50">
                  <td className="px-4 py-3 font-semibold text-ink-900">{item.name}</td>
                  {levelName ? (
                    <td className="px-4 py-3 text-ink-700">
                      {item.educationLevel?.name ?? levelName(item) ?? '—'}
                    </td>
                  ) : null}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        aria-label={`Ubah ${item.name}`}
                        className="inline-flex items-center gap-1 rounded-radius-sm px-2 py-1 text-label-md font-semibold text-school-blue-700 hover:bg-school-blue-050 focus-visible:outline-school-blue-700"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => setTarget(item)}
                        aria-label={`Hapus ${item.name}`}
                        className="inline-flex items-center gap-1 rounded-radius-sm px-2 py-1 text-label-md font-semibold text-danger-700 hover:bg-danger-700/10 focus-visible:outline-danger-700"
                      >
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          label={title}
          onChange={onPageChange}
        />
      </SectionState>

      <ConfirmDialog
        open={Boolean(target)}
        title={`Hapus ${target?.name ?? ''}`}
        message="Tindakan ini tidak dapat dibatalkan. Pastikan data tidak dipakai pada kelas atau penugasan."
        confirmLabel="Hapus"
        onConfirm={() => {
          onDelete(target)
          setTarget(null)
        }}
        onClose={() => setTarget(null)}
      />
    </div>
  )
}