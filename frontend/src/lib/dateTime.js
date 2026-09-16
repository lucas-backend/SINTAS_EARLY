const SCHOOL_TIMEZONE =
  import.meta.env.VITE_SCHOOL_TIMEZONE ?? 'Asia/Jakarta'

function formatter(options) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: SCHOOL_TIMEZONE,
    ...options,
  })
}

export function formatSchoolDate(value) {
  if (!value) return ''
  return formatter({ dateStyle: 'medium' }).format(new Date(value))
}

export function formatSchoolTime(value) {
  if (!value) return ''
  return formatter({ timeStyle: 'short' }).format(new Date(value))
}

export function formatSchoolDateTime(value) {
  if (!value) return ''
  return formatter({ dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}