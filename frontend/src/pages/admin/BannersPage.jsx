import { Megaphone, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SectionState } from '../../components/feedback/SectionState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { Pagination } from '../../components/common/Pagination'
import { Skeleton } from '../../components/common/Skeleton'
import { useIsOnline } from '../../hooks/useIsOnline'
import { BannerFormDialog } from '../../features/admin/forms/BannerFormDialog'
import { useDeleteBanner, useManagedBanners } from '../../features/admin/hooks/useManageBanners'
import { BannerDesktopTable, BannerMobileList } from '../../features/admin/views/BannerViews'

const BASE = { page: 1, limit: 20 }

export default function AdminBannersPage() {
  const online = useIsOnline()
  const [applied, setApplied] = useState({ ...BASE, search: '', isActive: '' })
  const [draft, setDraft] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const deleteBanner = useDeleteBanner()

  const filters = {
    page: applied.page,
    limit: applied.limit,
    search: applied.search || undefined,
    isActive: applied.isActive || undefined,
  }
  const bannersQuery = useManagedBanners(filters)
  const items = bannersQuery.data?.items ?? []
  const meta = bannersQuery.data?.meta ?? { total: 0, totalPages: 0 }

  const applyDraft = (event) => {
    event.preventDefault()
    setApplied((current) => ({ ...current, search: draft.trim(), page: 1 }))
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-heading-lg font-bold text-ink-900">Banner sekolah</h1>
          <p className="mt-1 text-body-md text-ink-700">
            Banner yang tampil di beranda seluruh pengguna sesuai periode dan statusnya.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-radius-md bg-school-blue-700 px-4 py-2.5 text-label-md text-white hover:bg-school-blue-900"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Banner baru
        </button>
      </div>

      <form
        onSubmit={applyDraft}
        className="flex flex-wrap items-end gap-3 rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1"
      >
        <div className="min-w-52 flex-1">
          <label htmlFor="banner-search" className="block text-label-md text-ink-700">
            Cari judul
          </label>
          <input
            id="banner-search"
            type="search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Contoh: ujian tengah semester"
            className="mt-1 w-full rounded-radius-sm border border-line-200 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
          />
        </div>
        <div className="min-w-40">
          <label htmlFor="banner-status" className="block text-label-md text-ink-700">
            Status
          </label>
          <select
            id="banner-status"
            value={applied.isActive}
            onChange={(event) =>
              setApplied((current) => ({ ...current, isActive: event.target.value, page: 1 }))
            }
            className="mt-1 w-full rounded-radius-sm border border-line-200 bg-surface-0 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
          >
            <option value="">Semua status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-radius-md bg-school-blue-700 px-4 py-2 text-label-md text-white hover:bg-school-blue-900"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Terapkan
        </button>
      </form>

      <SectionState
        query={bannersQuery}
        online={online}
        isEmpty={items.length === 0}
        empty={
          <EmptyState
            title="Belum ada banner"
            message="Buat banner pertama agar pengguna melihat informasi dari beranda."
            action={
              <button
                type="button"
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
                className="mt-1 inline-flex items-center gap-1.5 rounded-radius-md bg-school-blue-700 px-4 py-2 text-label-md text-white"
              >
                <Megaphone className="h-4 w-4" aria-hidden="true" />
                Banner baru
              </button>
            }
          />
        }
        skeleton={
          <div className="space-y-3">
            {[0, 1, 2].map((value) => (
              <Skeleton key={value} className="h-16 w-full" />
            ))}
          </div>
        }
        errorTitle="Banner tidak dapat dimuat."
      >
        <BannerMobileList
          items={items}
          onEdit={(banner) => { setEditing(banner); setFormOpen(true) }}
          onDelete={setDeleteTarget}
        />
        <BannerDesktopTable
          items={items}
          onEdit={(banner) => { setEditing(banner); setFormOpen(true) }}
          onDelete={setDeleteTarget}
        />

        <Pagination
          page={filters.page}
          totalPages={meta.totalPages}
          total={meta.total}
          label="banner"
          onChange={(page) => setApplied((current) => ({ ...current, page }))}
        />
      </SectionState>

      <BannerFormDialog
        key={formOpen ? (editing?.id ?? 'new') : 'closed'}
        open={formOpen}
        banner={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Hapus banner "${deleteTarget?.title ?? ''}"`}
        message="Banner tidak akan tampil lagi dan perubahan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        busy={deleteBanner.isPending}
        onConfirm={() => {
          deleteBanner.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  )
}