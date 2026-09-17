import { Download, FileSearch } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { SectionState } from '../../components/feedback/SectionState'
import { Pagination } from '../../components/common/Pagination'
import { Skeleton } from '../../components/common/Skeleton'
import { useIsOnline } from '../../hooks/useIsOnline'
import { getErrorMessage } from '../../lib/errorMapping'
import { reportFilterSchema, reportFiltersToQuery } from '../../schemas/admin'
import { useClasses } from '../../features/admin/hooks/useAcademicMasters'
import { useGlobalReport } from '../../features/admin/hooks/useGlobalReport'
import { useExportReport } from '../../features/teacher/hooks/useExportReport'
import { ReportDesktopTable, ReportMobileList } from '../../features/admin/views/ReportViews'

const BASE_FILTERS = { from: '', to: '', status: '', classId: '' }
const LIMIT = 20
const EMPTY_FILTERS = { from: undefined, to: undefined, status: undefined, classId: undefined }

export default function AdminReportsPage() {
  const online = useIsOnline()
  const [draft, setDraft] = useState(BASE_FILTERS)
  const [applied, setApplied] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [page, setPage] = useState(1)
  const exportReport = useExportReport()

  const classesQuery = useClasses({ page: 1, limit: 100 })
  const classes = classesQuery.data?.items ?? []

  const query = applied ?? EMPTY_FILTERS
  const reportQuery = useGlobalReport({ ...query, page, limit: LIMIT })
  const items = reportQuery.data?.items ?? []
  const meta = reportQuery.data?.meta ?? { total: 0, totalPages: 0 }

  const applyFilters = (event) => {
    event.preventDefault()
    const result = reportFilterSchema.safeParse(draft)
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors)
      return
    }
    setFieldErrors({})
    setApplied(reportFiltersToQuery(result.data))
    setPage(1)
  }

  const handleExport = () => {
    const result = reportFilterSchema.safeParse(draft)
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors)
      return
    }
    setFieldErrors({})
    exportReport.mutate(reportFiltersToQuery(result.data))
  }

  const isFiltered = applied !== null
  const fromError = fieldErrors.from?.[0]

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-heading-lg font-bold text-ink-900">Laporan kehadiran</h1>
          <p className="mt-1 text-body-md text-ink-700">
            Rekap seluruh sesi di sekolah. Filter opsional untuk mempersempit cakupan.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exportReport.isPending}
          className="inline-flex items-center gap-2 rounded-radius-md bg-school-blue-700 px-4 py-2.5 text-label-md text-white hover:bg-school-blue-900 disabled:opacity-60"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {exportReport.isPending ? 'Mengekspor…' : 'Export XLSX'}
        </button>
      </div>

      <form
        onSubmit={applyFilters}
        className="flex flex-wrap items-end gap-3 rounded-radius-md border border-line-200 bg-surface-0 p-4 shadow-1"
        noValidate
      >
        <div className="min-w-56">
          <label htmlFor="report-from" className="block text-label-md text-ink-700">
            Dari tanggal
          </label>
          <input
            id="report-from"
            type="date"
            value={draft.from}
            onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value }))}
            aria-invalid={fromError ? true : undefined}
            aria-describedby={fromError ? 'report-from-error' : undefined}
            className="mt-1 w-full rounded-radius-sm border border-line-200 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
          />
          {fromError ? (
            <p id="report-from-error" className="mt-1 text-caption text-danger-700">
              {fromError}
            </p>
          ) : null}
        </div>
        <div className="min-w-56">
          <label htmlFor="report-to" className="block text-label-md text-ink-700">
            Sampai tanggal
          </label>
          <input
            id="report-to"
            type="date"
            value={draft.to}
            onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))}
            className="mt-1 w-full rounded-radius-sm border border-line-200 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
          />
        </div>
        <div className="min-w-40">
          <label htmlFor="report-class" className="block text-label-md text-ink-700">
            Kelas
          </label>
          <select
            id="report-class"
            value={draft.classId}
            onChange={(event) => setDraft((current) => ({ ...current, classId: event.target.value }))}
            className="mt-1 w-full rounded-radius-sm border border-line-200 bg-surface-0 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
          >
            <option value="">Semua kelas</option>
            {classes.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-40">
          <label htmlFor="report-status" className="block text-label-md text-ink-700">
            Status
          </label>
          <select
            id="report-status"
            value={draft.status}
            onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
            className="mt-1 w-full rounded-radius-sm border border-line-200 bg-surface-0 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
          >
            <option value="">Semua status</option>
            <option value="HADIR">Hadir</option>
            <option value="TERLAMBAT">Terlambat</option>
            <option value="TIDAK_HADIR">Tidak hadir</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-radius-md bg-school-blue-700 px-4 py-2 text-label-md text-white hover:bg-school-blue-900"
        >
          <FileSearch className="h-4 w-4" aria-hidden="true" />
          Terapkan
        </button>
        {isFiltered ? (
          <button
            type="button"
            onClick={() => {
              setDraft(BASE_FILTERS)
              setApplied(null)
              setFieldErrors({})
              setPage(1)
            }}
            className="rounded-radius-md px-3 py-2 text-label-md text-ink-700 hover:bg-surface-50"
          >
            Reset filter
          </button>
        ) : null}
      </form>

      <SectionState
        query={reportQuery}
        online={online}
        isEmpty={items.length === 0}
        empty={
          <EmptyState
            title={isFiltered ? 'Tidak ada data laporan' : 'Belum ada data laporan'}
            message={
              isFiltered
                ? 'Ubah rentang tanggal, kelas, atau status, lalu terapkan kembali.'
                : 'Data akan muncul setelah sesi absensi berjalan.'
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
        errorTitle="Laporan tidak dapat dimuat."
      >
        <ReportMobileList items={items} />
        <ReportDesktopTable items={items} />

        <Pagination
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          label="laporan"
          onChange={setPage}
        />

        {exportReport.isError ? (
          <p role="alert" className="text-body-md text-danger-700">
            {getErrorMessage(exportReport.error)}
          </p>
        ) : null}
      </SectionState>
    </section>
  )
}