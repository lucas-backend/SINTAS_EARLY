import { Check, Circle, Clock, Hourglass, X } from 'lucide-react'

const TONE_CLASSES = {
  success: 'bg-success-700/10 text-success-700',
  warning: 'bg-warning-700/10 text-warning-700',
  danger: 'bg-danger-700/10 text-danger-700',
  info: 'bg-school-blue-050 text-school-blue-900',
  neutral: 'bg-surface-50 text-ink-700',
}

const STATUS_ICONS = {
  HADIR: Check,
  TERLAMBAT: Clock,
  TIDAK_HADIR: X,
  BISA_ABSEN: Circle,
  BELUM_DIBUKA: Hourglass,
  SELESAI: Clock,
}

// Status selalu ditampilkan dengan teks; warna/ikon hanya penguat
// (docs/DESIGN_BRIEF.md section 3 & 10, frontend/GUIDE.md section 7).
export function StatusBadge({ status, tone = 'neutral', icon, label }) {
  const Icon = icon ?? STATUS_ICONS[status] ?? null
  const text = label ?? status
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-radius-pill px-2.5 py-1 text-label-md ${TONE_CLASSES[tone] ?? TONE_CLASSES.neutral}`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      <span>{text}</span>
    </span>
  )
}