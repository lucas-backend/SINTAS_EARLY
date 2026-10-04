import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import {
  activeBanner,
  renderApp,
  scheduleItem,
  studentUser,
} from '../../test/fixtures'
import { API_BASE_URL, server } from '../../test/server'

const TODAY_HANDLER = (items) =>
  http.get(`${API_BASE_URL}/attendance/today`, () =>
    HttpResponse.json({ data: items }),
  )

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
  it('menampilkan sapaan, banner, dan jadwal hari ini dengan tombol scan', async () => {
    renderDashboard([
      TODAY_HANDLER([
        scheduleItem({ id: 10, windowStatus: 'BISA_ABSEN' }),
      ]),
      http.get(`${API_BASE_URL}/banners`, () =>
        HttpResponse.json({ data: [activeBanner] }),
      ),
    ])

    expect(
      await screen.findByRole('heading', { name: 'Halo, Siswa' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Ujian Tengah Semester')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Jadwal hari ini' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Matematika')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Scan QR Matematika' }),
    ).toHaveAttribute('href', '/app/student/scan?session=10')
    expect(
      screen.queryByLabelText('Sudah absen Matematika'),
    ).not.toBeInTheDocument()
  })

  it('menampilkan ceklis hijau untuk sesi yang sudah discan', async () => {
    renderDashboard([
      TODAY_HANDLER([
        scheduleItem({ id: 10, windowStatus: 'SELESAI', scanned: true }),
      ]),
    ])

    expect(
      await screen.findByLabelText('Sudah absen Matematika'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Scan QR Matematika' }),
    ).not.toBeInTheDocument()
  })

  it('menampilkan state kosong saat tidak ada jadwal hari ini', async () => {
    renderDashboard([TODAY_HANDLER([])])

    expect(
      await screen.findByText('Belum ada jadwal hari ini'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /^Scan QR/ }),
    ).not.toBeInTheDocument()
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
