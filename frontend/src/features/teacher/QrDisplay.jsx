import { QRCodeSVG } from 'qrcode.react'

// Menampilkan QR statis dari payload yang dikembalikan backend. Frontend tidak
// membuat, merotasi, atau memvalidasi payload sesi (frontend/GUIDE.md section 6).
export function QrDisplay({ payload, title, size = 256 }) {
  if (!payload) return null
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-radius-lg border border-line-200 bg-surface-0 p-4 shadow-1">
        <QRCodeSVG
          value={payload}
          size={size}
          level="M"
          marginSize={2}
          title={title}
        />
      </div>
      <p className="max-w-sm text-center text-body-md text-ink-700">
        Arahkan kamera siswa ke QR Code ini selama jendela absensi.
      </p>
    </div>
  )
}
