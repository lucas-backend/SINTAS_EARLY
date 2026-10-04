import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { activeBanner, renderApp, studentUser } from '../../test/fixtures'
import { API_BASE_URL, server } from '../../test/server'

function renderDashboard(handlers = []) {
  server.use(
    http.get(`${API_BASE_URL}/me`, () =>
      HttpResponse.json({ data: { user: studentUser } }),
    ),
    ...handlers,
  )
  renderApp(['/app/student'])
}

describe('dashboard siswa', () => {
  it('menampilkan sapaan, banner, dan fitur dari server', async () => {
    renderDashboard([
      http.get(`${API_BASE_URL}/banners`, () =>
        HttpResponse.json({ data: [activeBanner] }),
      ),
    ])

    expect(
      await screen.findByRole('heading', { name: 'Halo, Siswa' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Ujian Tengah Semester')).toBeInTheDocument()
    expect(await screen.findByText('Absen')).toBeInTheDocument()
    expect(screen.getAllByText('Jadwal').length).toBeGreaterThan(0)
    expect(screen.queryByText('Riwayat')).not.toBeInTheDocument()
    expect(screen.queryByText('Perbarui data profil Anda.')).not.toBeInTheDocument()
  })

  it('tidak menampilkan section absensi dan jadwal terdekat', async () => {
    renderDashboard()

    await screen.findByRole('heading', { name: 'Halo, Siswa' })
    expect(screen.queryByText('Absensi hari ini')).not.toBeInTheDocument()
    expect(screen.queryByText('Jadwal terdekat')).not.toBeInTheDocument()
  })

  it('banner hanya menampilkan isi tanpa gambar saat imageUrl kosong', async () => {
    renderDashboard([
      http.get(`${API_BASE_URL}/banners`, () =>
        HttpResponse.json({ data: [activeBanner] }),
      ),
    ])
    await screen.findByText('Ujian Tengah Semester')
    expect(
      screen.queryByRole('img', { name: /Ujian Tengah Semester/ }),
    ).not.toBeInTheDocument()
  })

  it('menampilkan error banner yang bisa dimuat ulang', async () => {
    renderDashboard([
      http.get(`${API_BASE_URL}/banners`, () =>
        HttpResponse.json(
          {
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Terjadi kesalahan server.',
            },
          },
          { status: 500 },
        ),
      ),
    ])

    expect(await screen.findByText('Banner tidak dapat dimuat.')).toBeInTheDocument()

    server.use(
      http.get(`${API_BASE_URL}/me`, () =>
        HttpResponse.json({ data: { user: studentUser } }),
      ),
      http.get(`${API_BASE_URL}/banners`, () =>
        HttpResponse.json({ data: [activeBanner] }),
      ),
    )
    await userEvent.setup().click(screen.getByRole('button', { name: 'Coba lagi' }))
    expect(await screen.findByText('Ujian Tengah Semester')).toBeInTheDocument()
  })

  it('menampilkan pemberitahuan offline saat jaringan terputus', async () => {
    renderDashboard([
      http.get(`${API_BASE_URL}/banners`, () => HttpResponse.error()),
    ])
    expect((await screen.findAllByText('Koneksi terputus.')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Data belum dapat dimuat.').length).toBeGreaterThan(0)
  })
})
