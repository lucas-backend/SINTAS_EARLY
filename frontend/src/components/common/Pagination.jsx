// Navigasi halaman untuk tabel ter-paginasi; pola sama dengan halaman
// riwayat siswa agar perilaku keyboard dan label konsisten.
export function Pagination({ page, totalPages, total, label = 'Daftar', onChange }) {
  const max = totalPages || 1
  return (
    <nav
      aria-label={`Navigasi halaman ${label}`}
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-body-md text-ink-700" aria-live="polite">
        {total} entri.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="rounded-radius-md border border-line-200 bg-surface-0 px-3 py-2 text-label-md text-ink-700 hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sebelumnya
        </button>
        <span className="text-body-md text-ink-700">
          Halaman {page} dari {max}
        </span>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= max}
          className="rounded-radius-md border border-line-200 bg-surface-0 px-3 py-2 text-label-md text-ink-700 hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Berikutnya
        </button>
      </div>
    </nav>
  )
}