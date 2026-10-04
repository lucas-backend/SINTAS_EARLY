import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useState } from 'react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SectionState } from '../../components/feedback/SectionState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { Pagination } from '../../components/common/Pagination'
import { Skeleton } from '../../components/common/Skeleton'
import { useIsOnline } from '../../hooks/useIsOnline'
import { schoolDateString } from '../../lib/dateTime'
import { SessionAdminFormDialog } from '../../features/admin/forms/SessionAdminFormDialog'
import {
  useAdminSessions,
  useDeleteAdminSession,
} from '../../features/admin/hooks/useAdminSessions'
import { SessionDesktopTable, SessionMobileList } from '../../features/admin/views/SessionViews'

const PAGE_SIZE = 20

const selectClass =
  'mt-1 w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-black focus:outline-none'

export default function AdminSessionsPage() {
  const online = useIsOnline()
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const deleteSession = useDeleteAdminSession()

  const sessionsQuery = useAdminSessions()

  const sessions = sessionsQuery.data ?? []

  const classOptions = Array.from(
    sessions.reduce((map, session) => {
      if (session.classId && !map.has(session.classId)) map.set(session.classId, session.className ?? `Kelas #${session.classId}`)
      return map
    }, new Map()),
  ).map(([id, name]) => ({ id, name }))

  const filtered = sessions.filter((session) => {
    if (classId && String(session.classId) !== classId) return false
    if (date && schoolDateString(session.sessionDate) !== date) return false
    return true
  })
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 min-h-[75vh]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Jadwal absensi</h1>
          <p className="mt-1 text-sm text-slate-700">
            Kelola jadwal sesi absensi seluruh kelas. Sesi dengan kehadiran terkunci.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <AddRoundedIcon className="h-4! w-4!" aria-hidden="true" />
          Jadwal baru
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-black/10 bg-white p-4">
        <div className="min-w-52">
          <label htmlFor="admin-session-class-filter" className="block text-sm font-medium text-slate-700">
            Kelas
          </label>
          <select
            id="admin-session-class-filter"
            value={classId}
            onChange={(event) => {
              setClassId(event.target.value)
              setPage(1)
            }}
            className={selectClass}
          >
            <option value="">Semua kelas</option>
            {classOptions.map((entry) => (
              <option key={entry.id} value={String(entry.id)}>
                {entry.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-44">
          <label htmlFor="admin-session-date-filter" className="block text-sm font-medium text-slate-700">
            Tanggal
          </label>
          <input
            id="admin-session-date-filter"
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value)
              setPage(1)
            }}
            className={selectClass}
          />
        </div>
      </div>

      <SectionState
        query={sessionsQuery}
        online={online}
        isEmpty={items.length === 0}
        empty={
          <EmptyState
            title={sessions.length === 0 ? 'Belum ada sesi absensi' : 'Tidak ada sesi yang cocok'}
            message={
              sessions.length === 0
                ? 'Buat jadwal pertama untuk memulai absensi kelas.'
                : 'Ubah filter kelas atau tanggal, lalu coba lagi.'
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
        errorTitle="Sesi absensi tidak dapat dimuat."
      >
        <SessionMobileList
          items={items}
          onEdit={(session) => {
            setEditing(session)
            setFormOpen(true)
          }}
          onDelete={setDeleteTarget}
        />
        <SessionDesktopTable
          items={items}
          onEdit={(session) => {
            setEditing(session)
            setFormOpen(true)
          }}
          onDelete={setDeleteTarget}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          label="sesi"
          onChange={setPage}
        />
      </SectionState>

      <SessionAdminFormDialog
        key={formOpen ? editing?.id ?? 'new' : 'closed'}
        open={formOpen}
        session={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Hapus sesi ${deleteTarget?.subjectName ?? ''}`}
        message="Sesi akan dihapus dan tidak lagi tersedia untuk absensi. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        busy={deleteSession.isPending}
        onConfirm={() => {
          deleteSession.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  )
}
