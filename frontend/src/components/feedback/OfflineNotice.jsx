import { WifiOff } from 'lucide-react'
import { formatSchoolDateTime } from '../../lib/dateTime'

// State offline: jangan mengklaim data terbaru. Tampilkan waktu cache terakhir
// bila ada, plus aksi Coba lagi (docs/DESIGN_BRIEF.md section 8).
export function OfflineNotice({ updatedAt, onRetry }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-2 rounded-radius-md border border-line-200 bg-surface-0 px-6 py-6 text-center"
    >
      <WifiOff className="h-8 w-8 text-ink-500" aria-hidden="true" />
      <h3 className="text-heading-sm font-bold text-ink-900">Koneksi terputus.</h3>
      <p className="max-w-md text-sm text-ink-700">
        {updatedAt
          ? `Menampilkan data terakhir yang dimuat pada ${formatSchoolDateTime(updatedAt)}.`
          : 'Data belum dapat dimuat.'}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-radius-sm bg-school-blue-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Coba lagi
        </button>
      ) : null}
    </div>
  )
}