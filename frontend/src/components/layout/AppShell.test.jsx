import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_BASE_URL, server } from '../../test/server'
import { renderApp, studentUser, teacherUser } from '../../test/fixtures'

describe('app shell dan navigasi per role', () => {
  it('menampilkan navigasi Beranda dan Profil pada bottom nav siswa', async () => {
    server.use(
      http.get(`${API_BASE_URL}/me`, () =>
        HttpResponse.json({ data: { user: studentUser } }),
      ),
    )
    renderApp(['/app/student'])
    await screen.findByRole('heading', { name: 'Halo, Siswa' })
    const bottomNav = screen.getByRole('navigation', { name: 'Navigasi bawah' })
    expect(
      within(bottomNav).getByRole('button', { name: 'Beranda' }),
    ).toBeInTheDocument()
    expect(
      within(bottomNav).getByRole('button', { name: 'Profil' }),
    ).toBeInTheDocument()
    expect(
      within(bottomNav).queryByRole('button', { name: 'Jadwal' }),
    ).not.toBeInTheDocument()
    expect(
      within(bottomNav).queryByRole('button', { name: 'Riwayat' }),
    ).not.toBeInTheDocument()
  })

  it('menampilkan navigasi Beranda dan Profil untuk guru', async () => {
    server.use(
      http.get(`${API_BASE_URL}/me`, () =>
        HttpResponse.json({ data: { user: teacherUser } }),
      ),
    )
    renderApp(['/app/teacher'])
    await screen.findByRole('heading', { name: 'Beranda Guru' })
    expect(
      screen.getByRole('link', { name: 'Beranda' }).getAttribute('href'),
    ).toBe('/app/teacher')
    expect(
      screen.getByRole('link', { name: 'Profil' }).getAttribute('href'),
    ).toBe('/app/teacher/profile')
  })

  it('keluar mengarahkan kembali ke halaman masuk', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${API_BASE_URL}/me`, () =>
        HttpResponse.json({ data: { user: teacherUser } }),
      ),
      http.post(`${API_BASE_URL}/auth/logout`, () =>
        HttpResponse.json({ data: { message: 'Logout berhasil.' } }),
      ),
    )
    renderApp(['/app/teacher'])
    await screen.findByRole('heading', { name: 'Beranda Guru' })
    await user.click(screen.getByRole('button', { name: 'Menu akun' }))
    await user.click(screen.getByRole('menuitem', { name: 'Keluar' }))
    expect(await screen.findByRole('heading', { name: 'Masuk' })).toBeInTheDocument()
  })
})