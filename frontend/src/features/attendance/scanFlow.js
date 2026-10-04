import { getErrorCode, getErrorMessage } from '../../lib/errorMapping'
import { formatSchoolTime } from '../../lib/dateTime'

// Konfigurasi panel hasil scan untuk error. Client tidak menghitung status
// absensi; pesan disusun dari code server + konteks sesi yang sudah diketahui
// (docs/DESIGN_BRIEF.md: setiap status memberi jalan keluar).
export function scanErrorPanel(error, sessionItem) {
  const code = getErrorCode(error)
  const fallbackMessage = getErrorMessage(error)

  if (code === 'NETWORK_ERROR') {
    return {
      tone: 'danger',
      title: 'Koneksi terputus',
      message: 'Absensi belum tercatat. Coba lagi saat koneksi tersedia.',
      retry: true,
      home: true,
    }
  }

  if (code === 'ATTENDANCE_WINDOW_CLOSED') {
    if (sessionItem?.windowStatus === 'BELUM_DIBUKA') {
      return {
        tone: 'info',
        title: 'Sesi belum dibuka',
        message: `Absensi dibuka pukul ${formatSchoolTime(sessionItem.startAt)}.`,
        retry: false,
        home: true,
      }
    }
    if (sessionItem?.windowStatus === 'SELESAI') {
      return {
        tone: 'neutral',
        title: 'Sesi selesai',
        message: 'Jendela absensi sudah ditutup.',
        retry: false,
        home: true,
      }
    }
    return {
      tone: 'info',
      title: 'Di luar jendela scan',
      message: fallbackMessage,
      retry: true,
      home: true,
    }
  }

  if (code === 'INVALID_QR_PAYLOAD') {
    return {
      tone: 'danger',
      title: 'QR Code tidak valid',
      message:
        'QR Code yang dipindai tidak dikenali. Minta guru menampilkan ulang QR Code lalu coba lagi.',
      retry: true,
      home: true,
    }
  }

  if (code === 'ATTENDANCE_SESSION_NOT_FOUND') {
    return {
      tone: 'danger',
      title: 'Sesi tidak ditemukan',
      message: 'Sesi absensi ini tidak tersedia atau sudah tidak aktif.',
      retry: false,
      home: true,
    }
  }

  if (code === 'CLASS_MEMBERSHIP_REQUIRED') {
    return {
      tone: 'danger',
      title: 'Bukan anggota kelas',
      message: 'Anda tidak terdaftar pada kelas sesi ini.',
      retry: false,
      home: true,
    }
  }

  if (code === 'RATE_LIMITED') {
    return {
      tone: 'warning',
      title: 'Terlalu banyak percobaan scan',
      message: fallbackMessage,
      retry: true,
      home: true,
    }
  }

  if (code === 'UNAUTHENTICATED' || code === 'FORBIDDEN') {
    return {
      tone: 'danger',
      title: 'Akses ditolak',
      message: fallbackMessage,
      retry: false,
      home: true,
    }
  }

  return {
    tone: 'danger',
    title: 'Absensi gagal',
    message: fallbackMessage,
    retry: true,
    home: true,
  }
}

// Teks live region untuk status kamera (docs/DESIGN_BRIEF.md section 10.3).
export function cameraAnnouncement(status) {
  if (status === 'starting') return 'Menyalakan kamera.'
  if (status === 'ready') return 'Kamera siap. Arahkan kamera ke QR Code.'
  if (status === 'denied')
    return 'Akses kamera ditolak. Izinkan kamera di pengaturan browser.'
  if (status === 'unavailable')
    return 'Kamera tidak tersedia pada perangkat ini.'
  if (status === 'error')
    return 'Kamera gagal dinyalakan. Coba lagi.'
  return ''
}
