import { Loader2 } from 'lucide-react'

export function PageLoader({ label = 'Memuat…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2
          className="h-8 w-8 animate-spin text-school-blue-700"
          aria-hidden="true"
        />
        <p className="text-sm text-ink-700">{label}</p>
      </div>
    </div>
  )
}