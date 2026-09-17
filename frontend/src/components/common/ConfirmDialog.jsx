import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

const CONFIRM_CLASSES = {
  danger: 'bg-danger-700 hover:bg-danger-900',
  neutral: 'bg-school-blue-700 hover:bg-school-blue-900',
}

// Konfirmasi tindakan destruktif/permanen; focus dikembalikan ke tombol asal
// oleh Headless UI, dan tombol confirm dapat diaktifkan dari keyboard.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  busy = false,
  tone = 'danger',
  onConfirm,
  onClose,
}) {
  return (
    <Dialog open={open} onClose={() => (busy ? null : onClose())} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-ink-900/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-radius-md bg-surface-0 p-6 shadow-2">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-radius-pill bg-danger-700/10">
              <AlertTriangle className="h-5 w-5 text-danger-700" aria-hidden="true" />
            </span>
            <div>
              <DialogTitle className="text-heading-sm font-bold text-ink-900">
                {title}
              </DialogTitle>
              {message ? (
                <p className="mt-1 text-body-md text-ink-700">{message}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-radius-md border border-line-200 bg-surface-0 px-4 py-2 text-label-md text-ink-700 hover:bg-surface-50 disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={`inline-flex items-center gap-1.5 rounded-radius-md px-4 py-2 text-label-md text-white disabled:opacity-60 ${CONFIRM_CLASSES[tone] ?? CONFIRM_CLASSES.danger}`}
            >
              {busy ? 'Memproses…' : confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}