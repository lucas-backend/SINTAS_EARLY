import { zodResolver } from '@hookform/resolvers/zod'
import { RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SectionState } from '../../components/feedback/SectionState'
import { Skeleton } from '../../components/common/Skeleton'
import { useIsOnline } from '../../hooks/useIsOnline'
import { HISTORY_STATUS_OPTIONS } from '../../lib/attendanceStatus'
import { schoolDateOffset, todaySchoolDate } from '../../lib/dateTime'
import { historyFilterSchema } from '../../schemas/history'
import { useStudentHistory } from '../../features/attendance/hooks/useStudentHistory'
import { HistoryDetailDialog } from '../../features/student/HistoryDetailDialog'
import {
  HistoryDesktopTable,
  HistoryMobileList,
} from '../../features/student/HistoryViews'

const DEFAULT_FILTERS = {
  from: schoolDateOffset(-6),
  to: todaySchoolDate(),
  status: '',
}

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3, 4].map((value) => (
        <Skeleton key={value} className="h-20 w-full" />
      ))}
    </div>
  )
}

function FieldError({ id, message }) {
  return message ? (
    <p id={id} className="mt-1 text-body-md text-danger-700">{message}</p>
  ) : null
}

export default function StudentHistoryPage() {
  const online = useIsOnline()
  const [applied, setApplied] = useState(DEFAULT_FILTERS)
  const [selected, setSelected] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(historyFilterSchema),
    defaultValues: DEFAULT_FILTERS,
  })

  const filters = {
    from: applied.from || undefined,
    to: applied.to || undefined,
    status: applied.status || undefined,
    page: applied.page ?? 1,
  }
  const history = useStudentHistory(filters)
  const items = history.data?.items ?? []
  const total = history.data?.meta?.total ?? 0
  const totalPages = history.data?.meta?.totalPages ?? 0
  const page = filters.page

  const onApply = (values) => {
    setApplied((current) => ({
      ...current,
      from: values.from || '',
      to: values.to || '',
      status: values.status ?? '',
      page: 1,
    }))
  }

  const onReset = () => {
    reset(DEFAULT_FILTERS)
    setApplied({ ...DEFAULT_FILTERS, page: 1 })
  }

  const changePage = (nextPage) => {
    setApplied((current) => ({ ...current, page: nextPage }))
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-heading-lg font-bold text-ink-900">Riwayat absensi</h1>
        <p className="mt-1 text-body-md text-ink-700">
          Riwayat kehadiran Anda diurutkan dari tanggal sesi terbaru.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onApply)}
        className="rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1"
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor="history-from" className="block text-label-md text-ink-700">
              Dari tanggal
            </label>
            <input
              id="history-from"
              type="date"
              className="mt-1 w-full rounded-radius-sm border border-line-200 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
              aria-invalid={errors.from ? true : undefined}
              aria-describedby={errors.from ? 'history-from-error' : undefined}
              {...register('from')}
            />
            <FieldError id="history-from-error" message={errors.from?.message} />
          </div>
          <div>
            <label htmlFor="history-to" className="block text-label-md text-ink-700">
              Sampai tanggal
            </label>
            <input
              id="history-to"
              type="date"
              className="mt-1 w-full rounded-radius-sm border border-line-200 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
              aria-invalid={errors.to ? true : undefined}
              aria-describedby={errors.to ? 'history-to-error' : undefined}
              {...register('to')}
            />
            <FieldError id="history-to-error" message={errors.to?.message} />
          </div>
          <div>
            <label htmlFor="history-status" className="block text-label-md text-ink-700">
              Status
            </label>
            <select
              id="history-status"
              className="mt-1 w-full rounded-radius-sm border border-line-200 bg-surface-0 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
              {...register('status')}
            >
              {HISTORY_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-radius-md bg-school-blue-700 px-4 py-2 text-label-md text-white disabled:opacity-60"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Terapkan
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-radius-md border border-line-200 bg-surface-0 px-4 py-2 text-label-md text-ink-700 hover:bg-surface-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </form>

      <p className="text-body-md text-ink-700" aria-live="polite">
        {history.isPending
          ? 'Memuat riwayat…'
          : total > 0
            ? `${total} catatan ditemukan.`
            : 'Belum ada riwayat pada periode ini.'}
      </p>

      <SectionState
        query={history}
        online={online}
        isEmpty={items.length === 0}
        empty={
          <EmptyState
            title="Belum ada riwayat pada periode ini"
            message="Coba ubah rentang tanggal atau filter status."
            action={
              <button
                type="button"
                onClick={onReset}
                className="mt-1 rounded-radius-md bg-school-blue-700 px-4 py-2 text-label-md text-white"
              >
                Ubah filter
              </button>
            }
          />
        }
        skeleton={<HistorySkeleton />}
        errorTitle="Riwayat tidak dapat dimuat."
      >
        <HistoryMobileList items={items} onSelect={setSelected} />
        <HistoryDesktopTable items={items} onSelect={setSelected} />

        <nav
          aria-label="Navigasi halaman riwayat"
          className="flex items-center justify-between gap-3"
        >
          <button
            type="button"
            onClick={() => changePage(page - 1)}
            disabled={page <= 1}
            className="rounded-radius-md border border-line-200 bg-surface-0 px-3 py-2 text-label-md text-ink-700 hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <span className="text-body-md text-ink-700">
            Halaman {page} dari {totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => changePage(page + 1)}
            disabled={page >= totalPages}
            className="rounded-radius-md border border-line-200 bg-surface-0 px-3 py-2 text-label-md text-ink-700 hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Berikutnya
          </button>
        </nav>
      </SectionState>

      <HistoryDetailDialog item={selected} onClose={() => setSelected(null)} />
    </section>
  )
}