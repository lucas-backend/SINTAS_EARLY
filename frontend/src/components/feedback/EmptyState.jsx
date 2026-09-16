import { Inbox } from 'lucide-react'

export function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-radius-md border border-dashed border-line-200 bg-surface-0 px-6 py-8 text-center">
      <Inbox className="h-8 w-8 text-ink-500" aria-hidden="true" />
      <h3 className="text-heading-sm font-bold text-ink-900">{title}</h3>
      {message ? <p className="max-w-md text-sm text-ink-700">{message}</p> : null}
      {action}
    </div>
  )
}