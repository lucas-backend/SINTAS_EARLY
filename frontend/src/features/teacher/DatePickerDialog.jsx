import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'

// Dialog pemilih tanggal jadwal guru (PLAN_JADWAL_GURU G3). Memakai Headless UI
// agar fokus terperangkap dan dapat ditutup dengan keyboard.
export function DatePickerDialog({ open, value, onClose, onSelect }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-2xl bg-white p-6">
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-base font-bold text-ink-900">
              Pilih tanggal
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup dialog"
              className="rounded-lg p-1.5 text-slate-700 hover:bg-blue-100/50 hover:text-ink-900"
            >
              <CloseRoundedIcon className="h-5! w-5!" aria-hidden="true" />
            </button>
          </div>

          <label
            htmlFor="schedule-date-picker"
            className="mt-5 block text-sm font-medium text-slate-700"
          >
            Tanggal
          </label>
          <input
            id="schedule-date-picker"
            type="date"
            value={value}
            onChange={(event) => {
              if (event.target.value) onSelect(event.target.value)
            }}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-black focus:outline-none"
          />
        </DialogPanel>
      </div>
    </Dialog>
  )
}