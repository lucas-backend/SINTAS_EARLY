import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp, adminUser } from '../../test/fixtures'
import { API_BASE_URL, server } from '../../test/server'

const USERS_URL = `${API_BASE_URL}/users`

function page(items) {
  return {
    items,
    meta: { page: 1, limit: 20, total: items.length, totalPages: 1 },
  }
}

function renderUsers(handlers) {
  server.use(
    http.get(`${API_BASE_URL}/me`, () =>
      HttpResponse.json({ data: { user: adminUser } }),
    ),
    ...handlers,
  )
  renderApp(['/app/admin/users'])
}

describe('halaman pengguna admin', () => {
  it('menampilkan daftar pengguna beserta perannya', async () => {
    renderUsers([
      http.get(USERS_URL, () =>
        HttpResponse.json({
          data: page([
            {
              id: 1,
              username: 'student.demo',
              role: 'STUDENT',
              name: 'Siswa Demo',
              email: null,
              phone: null,
              birthDate: null,
              studentNumber: 'S-0001',
            },
            {
              id: 2,
              username: 'teacher.demo',
              role: 'TEACHER',
              name: 'Guru Demo',
              email: 'teacher.demo@school.test',
              phone: null,
              birthDate: null,
            },
          ]),
        }),
      ),
    ])

    expect((await screen.findAllByText('Siswa Demo')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Guru Demo').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Guru').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Siswa').length).toBeGreaterThan(0)
  })

  it('mengirim kata kunci pencarian ke backend', async () => {
    const user = userEvent.setup()
    const requests = []
    renderUsers([
      http.get(USERS_URL, ({ request }) => {
        requests.push(new URL(request.url).searchParams.get('search'))
        return HttpResponse.json({ data: page([]) })
      }),
    ])

    await screen.findByLabelText('Cari nama atau username')
    await user.type(screen.getByLabelText('Cari nama atau username'), 'budi')
    await user.click(screen.getByRole('button', { name: 'Terapkan' }))

    await waitFor(() => expect(requests).toContain('budi'))
  })

  it('mereset password dengan mengirim password dan konfirmasi', async () => {
    const user = userEvent.setup()
    let body = null
    renderUsers([
      http.get(USERS_URL, () =>
        HttpResponse.json({
          data: page([
            {
              id: 1,
              username: 'student.demo',
              role: 'STUDENT',
              name: 'Siswa Demo',
              email: null,
              phone: null,
              birthDate: null,
              studentNumber: 'S-0001',
            },
          ]),
        }),
      ),
      http.patch(`${API_BASE_URL}/users/1/password`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: { reset: true } })
      }),
    ])

    await screen.findAllByText('Siswa Demo')
    await user.click(screen.getAllByRole('button', { name: /reset password/i })[0])

    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Password baru'), 'KataRahasia123!')
    await user.type(
      within(dialog).getByLabelText('Konfirmasi password'),
      'KataRahasia123!',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Reset password' }))

    await waitFor(() => expect(body).not.toBeNull())
    expect(body).toEqual({
      password: 'KataRahasia123!',
      passwordConfirmation: 'KataRahasia123!',
    })
  })

  it('mengubah data pengguna', async () => {
    const user = userEvent.setup()
    let body = null
    renderUsers([
      http.get(USERS_URL, () =>
        HttpResponse.json({
          data: page([
            {
              id: 1,
              username: 'student.demo',
              role: 'STUDENT',
              name: 'Siswa Demo',
              email: null,
              phone: null,
              birthDate: null,
              studentNumber: 'S-0001',
            },
          ]),
        }),
      ),
      http.patch(`${API_BASE_URL}/users/1`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: { id: 1, name: body.name } })
      }),
    ])

    await screen.findAllByText('Siswa Demo')
    await user.click(screen.getAllByRole('button', { name: 'Ubah' })[0])

    const dialog = await screen.findByRole('dialog')
    const nameInput = within(dialog).getByLabelText('Nama lengkap')
    await user.clear(nameInput)
    await user.type(nameInput, 'Siswa Baru')
    await user.click(within(dialog).getByRole('button', { name: 'Simpan perubahan' }))

    await waitFor(() => expect(body).not.toBeNull())
    expect(body.name).toBe('Siswa Baru')
    expect(body.studentNumber).toBe('S-0001')
  })

  it('menghapus pengguna setelah konfirmasi', async () => {
    const user = userEvent.setup()
    let deleted = false
    renderUsers([
      http.get(USERS_URL, () =>
        HttpResponse.json({
          data: page([
            {
              id: 1,
              username: 'student.demo',
              role: 'STUDENT',
              name: 'Siswa Demo',
              email: null,
              phone: null,
              birthDate: null,
              studentNumber: 'S-0001',
            },
          ]),
        }),
      ),
      http.delete(`${API_BASE_URL}/users/1`, () => {
        deleted = true
        return HttpResponse.json({ data: { message: 'Pengguna berhasil dihapus.' } })
      }),
    ])

    await screen.findAllByText('Siswa Demo')
    await user.click(screen.getAllByRole('button', { name: 'Hapus' })[0])

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Hapus' }))

    await waitFor(() => expect(deleted).toBe(true))
  })
})