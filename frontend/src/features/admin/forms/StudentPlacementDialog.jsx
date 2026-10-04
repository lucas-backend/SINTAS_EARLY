import { useState } from 'react'
import { getErrorMessage } from '../../../lib/errorMapping'
import { useClasses } from '../hooks/useAcademicMasters'
import {
  useCreateMembership,
  useDeleteMembership,
  useMemberships,
} from '../hooks/usePlotting'
import { DialogShell, inputClass } from './DialogShell'

export function StudentPlacementDialog({ open, user, onClose }) {
  const [classId, setClassId] = useState('')
  const [error, setError] = useState(null)
  const membershipsQuery = useMemberships({ studentId: user?.id, limit: 100 })
  const classesQuery = useClasses({ page: 1, limit: 100 })
  const createMembership = useCreateMembership()
  const deleteMembership = useDeleteMembership()
  const pending = createMembership.isPending || deleteMembership.isPending

  const active =
    (membershipsQuery.data?.items ?? []).find((item) => item.isActive) ?? null

  const classes = classesQuery.data?.items ?? []

  const submit = async (event) => {
    event.preventDefault()
    if (!classId) {
      setError('Pilih kelas terlebih dahulu.')
      return
    }
    setError(null)
    try {
      if (active && String(active.classId) === classId) {
        onClose()
        return
      }
      if (active) {
        await deleteMembership.mutateAsync(active.id)
      }
      await createMembership.mutateAsync({
        classId: Number(classId),
        studentId: user.id,
      })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const remove = async () => {
    if (!active) return
    setError(null)
    try {
      await deleteMembership.mutateAsync(active.id)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <DialogShell
      open={open}
      title={`Penempatan ${user?.name ?? 'siswa'}`}
      description="Satu siswa hanya boleh berada pada satu kelas aktif."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error ? (
          <p role="alert" className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white">
            {error}
          </p>
        ) : null}

        <p className="text-sm text-slate-700">
          Kelas saat ini:{' '}
          <span className="font-semibold text-ink-900">
            {membershipsQuery.isPending
              ? 'Memuat…'
              : active?.class?.name ?? 'Belum ditempatkan'}
          </span>
        </p>

        <div>
          <label htmlFor="student-placement-class" className="block text-sm font-medium text-slate-700">
            Pilih kelas
          </label>
          <select
            id="student-placement-class"
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            className={inputClass}
          >
            <option value="">Pilih kelas</option>
            {classes.map((entry) => (
              <option key={entry.id} value={String(entry.id)}>
                {entry.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {active ? (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 disabled:opacity-60"
            >
              Keluarkan dari kelas
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-100/50 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={pending || membershipsQuery.isPending || !classId}
            className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? 'Menyimpan…' : active ? 'Pindah kelas' : 'Tempatkan'}
          </button>
        </div>
      </form>
    </DialogShell>
  )
}
