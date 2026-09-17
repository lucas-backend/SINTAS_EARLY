import { useState } from 'react'
import {
  useClasses,
  useDeleteClass,
  useDeleteEducationLevel,
  useDeleteSubject,
  useEducationLevels,
  useSubjects,
} from '../../features/admin/hooks/useAcademicMasters'
import { MasterFormDialog } from '../../features/admin/forms/MasterFormDialog'
import { MasterList } from '../../features/admin/views/AcademicViews'

const TABS = [
  { key: 'levels', label: 'Jenjang' },
  { key: 'classes', label: 'Kelas' },
  { key: 'subjects', label: 'Mata pelajaran' },
]

const LIMIT = 20

export default function AdminAcademicPage() {
  const [tab, setTab] = useState('levels')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({ open: false, type: 'educationLevel', item: null })

  const levelsQuery = useEducationLevels({ page: 1, limit: 100 })
  const classesQuery = useClasses({ page, limit: LIMIT })
  const subjectsQuery = useSubjects({ page, limit: LIMIT })
  const deleteLevel = useDeleteEducationLevel()
  const deleteClass = useDeleteClass()
  const deleteSubject = useDeleteSubject()

  const levels = levelsQuery.data?.items ?? []

  const openAdd = (type) => {
    setForm({ open: true, type, item: null })
  }
  const openEdit = (type, item) => {
    setForm({ open: true, type, item })
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-heading-lg font-bold text-ink-900">Akademik</h1>
        <p className="mt-1 text-body-md text-ink-700">Kelola jenjang, kelas, dan mata pelajaran.</p>
      </div>

      <div role="tablist" aria-label="Data akademik" className="flex flex-wrap gap-2">
        {TABS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={tab === entry.key}
            onClick={() => {
              setTab(entry.key)
              setPage(1)
            }}
            className={`rounded-radius-pill px-4 py-2 text-label-md focus-visible:outline-school-blue-700 ${
              tab === entry.key
                ? 'bg-school-blue-900 text-surface-0'
                : 'border border-line-200 bg-surface-0 text-ink-700 hover:bg-surface-50'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === 'levels' ? (
        <MasterList
          title="Jenjang"
          subtitle="Tingkat kelas, misalnya SMA."
          query={levelsQuery}
          items={levels}
          meta={levelsQuery.data?.meta}
          page={page}
          onPageChange={setPage}
          onAdd={() => openAdd('educationLevel')}
          onEdit={(item) => openEdit('educationLevel', item)}
          onDelete={(item) => deleteLevel.mutate(item.id)}
          emptyTitle="Belum ada jenjang"
          emptyMessage="Tambahkan jenjang seperti SMP atau SMA untuk mulai menyusun kelas."
        />
      ) : null}

      {tab === 'classes' ? (
        <MasterList
          title="Kelas"
          subtitle="Kelas di bawah jenjang tertentu."
          query={classesQuery}
          items={classesQuery.data?.items ?? []}
          meta={classesQuery.data?.meta}
          page={page}
          onPageChange={setPage}
          onAdd={() => openAdd('class')}
          onEdit={(item) => openEdit('class', item)}
          onDelete={(item) => deleteClass.mutate(item.id)}
          emptyTitle="Belum ada kelas"
          emptyMessage="Tambahkan kelas untuk menempatkan siswa dan menugaskan guru."
        />
      ) : null}

      {tab === 'subjects' ? (
        <MasterList
          title="Mata pelajaran"
          subtitle="Mata pelajaran yang diampu guru."
          query={subjectsQuery}
          items={subjectsQuery.data?.items ?? []}
          meta={subjectsQuery.data?.meta}
          page={page}
          onPageChange={setPage}
          onAdd={() => openAdd('subject')}
          onEdit={(item) => openEdit('subject', item)}
          onDelete={(item) => deleteSubject.mutate(item.id)}
          emptyTitle="Belum ada mata pelajaran"
          emptyMessage="Tambahkan mata pelajaran untuk dipetakan pada penugasan."
        />
      ) : null}

      <MasterFormDialog
        key={form.open ? (form.item?.id ?? form.type) : 'closed'}
        open={form.open}
        type={form.type}
        item={form.item}
        levels={levels}
        onClose={() => setForm({ ...form, open: false, item: null })}
      />
    </section>
  )
}