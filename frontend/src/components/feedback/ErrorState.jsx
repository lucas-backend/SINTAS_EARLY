import { AlertTriangle } from 'lucide-react'

export function ErrorState({ title = 'Terjadi kesalahan', message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-radius-md border border-line-200 bg-surface-0 px-6 py-8 text-center"
    >
      <AlertTriangle
        className="h-8 w-8 text-danger-700"
        aria-hidden="true"
      />
      <h2 className="text-heading-sm font-bold text-ink-900">{title}</h2>
      {message ? (
        <p className="max-w-md text-sm text-ink-700">{message}</p>
      ) : null}
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