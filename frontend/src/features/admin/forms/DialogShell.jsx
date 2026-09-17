import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { X } from 'lucide-react'

export function DialogShell({ open, title, description, onClose, children }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-ink-900/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg rounded-radius-md bg-surface-0 p-6 shadow-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-heading-sm font-bold text-ink-900">
                {title}
              </DialogTitle>
              {description ? (
                <p className="mt-1 text-body-md text-ink-700">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup dialog"
              className="rounded-radius-sm p-1.5 text-ink-500 hover:bg-surface-50 hover:text-ink-900 focus-visible:outline-school-blue-700"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-5">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export function FieldError({ id, message }) {
  return message ? (
    <p id={id} className="mt-1 text-body-md text-danger-700">
      {message}
    </p>
  ) : null
}

export const inputClass =
  'mt-1 w-full rounded-radius-sm border border-line-200 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700'