import { AlertTriangle, CameraOff } from 'lucide-react'
import { CAMERA_STATUS } from './cameraPermission'

// State gagal kamera (docs/PROMPT_GUIDE.md F3): setiap kegagalan menyediakan
// jalan keluar — kode manual, coba lagi, atau kembali.
export function ScanCameraFallback({ camera, onRetry, onManual, onBack }) {
  if (
    camera !== CAMERA_STATUS.DENIED &&
    camera !== CAMERA_STATUS.UNAVAILABLE &&
    camera !== CAMERA_STATUS.ERROR
  ) {
    return null
  }

  const isDenied = camera === CAMERA_STATUS.DENIED
  const config = isDenied
    ? {
        icon: CameraOff,
        title: 'Akses kamera ditolak',
        message:
          'Izinkan akses kamera di pengaturan browser untuk memindai, atau gunakan kode manual.',
      }
    : camera === CAMERA_STATUS.UNAVAILABLE
      ? {
          icon: CameraOff,
          title: 'Kamera tidak tersedia',
          message:
            'Perangkat ini tidak memiliki kamera yang bisa digunakan. Gunakan kode manual dari guru.',
        }
      : {
          icon: AlertTriangle,
          title: 'Kamera gagal dinyalakan',
          message: 'Coba nyalakan kamera lagi, atau gunakan kode manual.',
        }
  const Icon = config.icon

  return (
    <div
      role="alert"
      className="mx-auto w-full max-w-md rounded-radius-md border border-line-200 bg-surface-0 p-6 text-center shadow-1"
    >
      <Icon className="mx-auto h-10 w-10 text-danger-700" aria-hidden="true" />
      <h3 className="mt-3 text-heading-sm font-bold text-ink-900">
        {config.title}
      </h3>
      <p className="mt-1 text-body-md text-ink-700">{config.message}</p>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={onManual}
          className="inline-flex w-full items-center justify-center rounded-radius-md bg-school-blue-700 px-4 py-2.5 text-label-md text-white hover:bg-school-blue-900"
        >
          Masukkan kode manual
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex w-full items-center justify-center rounded-radius-md border border-line-200 bg-surface-0 px-4 py-2.5 text-label-md font-semibold text-school-blue-700 hover:bg-surface-50"
        >
          Coba lagi
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