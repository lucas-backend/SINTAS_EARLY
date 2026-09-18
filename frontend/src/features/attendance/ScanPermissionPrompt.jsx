import { Camera, HelpCircle } from 'lucide-react'

// Layar penjelas izin sebelum browser prompt kamera (docs/DESIGN_BRIEF.md 4.2).
// Kamera hanya diminta setelah aksi pengguna — tombol "Izinkan kamera".
export function ScanPermissionPrompt({ onAllow, onBack, onManual }) {
  return (
    <div
      role="region"
      aria-label="Izin kamera"
      className="mx-auto w-full max-w-md rounded-radius-md border border-line-200 bg-surface-0 p-6 text-center shadow-1"
    >
      <Camera className="mx-auto h-10 w-10 text-school-blue-700" aria-hidden="true" />
      <h2 className="mt-3 text-heading-md font-bold text-ink-900">Akses kamera</h2>
      <p className="mt-1 text-body-md text-ink-700">
        Kak Lia memerlukan izin kamera untuk memindai QR Code. Kamera hanya
        dinyalakan setelah Anda mengizinkan.
      </p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-caption text-ink-500">
        <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        Tanpa kamera? Gunakan kode manual dari guru.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={onAllow}
          className="inline-flex w-full items-center justify-center rounded-radius-md bg-school-blue-700 px-4 py-2.5 text-label-md text-white hover:bg-school-blue-900"
        >
          Izinkan kamera
        </button>
        <button
          type="button"
          onClick={onManual}
          className="inline-flex w-full items-center justify-center rounded-radius-md border border-line-200 bg-surface-0 px-4 py-2.5 text-label-md font-semibold text-school-blue-700 hover:bg-surface-50"
        >
          Masukkan kode manual
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-full items-center justify-center rounded-radius-md px-4 py-2.5 text-label-md font-semibold text-ink-700 hover:bg-surface-50"
        >
          Kembali
        </button>
      </div>
    </div>
  )
}