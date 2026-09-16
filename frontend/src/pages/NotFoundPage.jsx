import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-50 px-4 text-center">
      <h1 className="text-heading-lg text-ink-900">Halaman tidak ditemukan</h1>
      <p className="text-body-md text-ink-700">
        Alamat yang Anda buka tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        to="/app"
        className="mt-2 rounded-radius-md bg-school-blue-700 px-4 py-2.5 text-label-md text-white"
      >
        Kembali ke beranda
      </Link>
    </main>
  )
}