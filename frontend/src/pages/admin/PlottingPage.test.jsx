import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp, adminUser } from '../../test/fixtures'
import { API_BASE_URL, server } from '../../test/server'

const MEMBERSHIPS_URL = `${API_BASE_URL}/academic/memberships`
const CLASSES_URL = `${API_BASE_URL}/academic/classes`
const USERS_URL = `${API_BASE_URL}/users`

function page(items) {
  return {
    items,
    meta: { page: 1, limit: 20, total: items.length, totalPages: 1 },
  }
}

function membership(overrides) {
  return {
    id: 50,
    classId: 30,
    studentId: 1,
    isActive: true,
    createdAt: '2026-09-01T02:00:00.000Z',
    class: { id: 30, name: 'XII IPA 1' },
    student: { id: 1, name: 'Siswa Demo', studentNumber: 'S-0001' },
    ...overrides,
  }
}

function renderPlotting(handlers) {
  server.use(
    http.get(`${API_BASE_URL}/me`, () =>
      HttpResponse.json({ data: { user: adminUser } }),
    ),
    http.get(CLASSES_URL, () => HttpResponse.json({ data: page([{ id: 30, name: 'XII IPA 1' }]) })),
    http.get(USERS_URL, () =>
      HttpResponse.json({
        data: page([{ id: 1, username: 'student.demo', role: 'STUDENT', name: 'Siswa Demo', studentNumber: 'S-0001' }]),
      }),
    ),
    ...handlers,
  )
  renderApp(['/app/admin/plotting'])
}

describe('halaman penempatan admin', () => {
  it('menempatkan siswa dan mengirim payload kontrak', async () => {
    const user = userEvent.setup()
    let body = null
    renderPlotting([
      http.get(MEMBERSHIPS_URL, () => HttpResponse.json({ data: page([]) })),
      http.post(MEMBERSHIPS_URL, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: membership(body) })
      }),
    ])

    await screen.findByRole('heading', { name: 'Penempatan' })
    await user.click(screen.getByRole('button', { name: 'Tempatkan siswa' }))

    const dialog = await screen.findByRole('dialog')
    await user.selectOptions(within(dialog).getByLabelText('Kelas'), '30')
    await user.selectOptions(within(dialog).getByLabelText('Siswa'), '1')
    await user.click(within(dialog).getByRole('button', { name: 'Tempatkan' }))

    await waitFor(() => expect(body).not.toBeNull())
    expect(body).toEqual({ classId: 30, studentId: 1 })
  })

  it('menghapus penempatan setelah konfirmasi', async () => {
    const user = userEvent.setup()
    let deleteCount = 0
    renderPlotting([
      http.get(MEMBERSHIPS_URL, () => HttpResponse.json({ data: page([membership()]) })),
      http.delete(`${MEMBERSHIPS_URL}/50`, () => {
        deleteCount += 1
        return HttpResponse.json({ data: membership({ isActive: false }) })
      }),
    ])

    await screen.findAllByText('Siswa Demo')
    await user.click(screen.getAllByRole('button', { name: 'Hapus' })[0])

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Hapus penempatan Siswa Demo')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Hapus' }))

    await waitFor(() => expect(deleteCount).toBe(1))
  })

  it('mengaktifkan kembali penempatan nonaktif', async () => {
    const user = userEvent.setup()
    let body = null
    renderPlotting([
      http.get(MEMBERSHIPS_URL, () =>
        HttpResponse.json({ data: page([membership({ isActive: false })]) }),
      ),
      http.patch(`${MEMBERSHIPS_URL}/50`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: membership({ isActive: true }) })
      }),
    ])

    await screen.findAllByText('Siswa Demo')
    await user.click(screen.getAllByRole('button', { name: 'Aktifkan' })[0])

    await waitFor(() => expect(body).not.toBeNull())
    expect(body).toEqual({ isActive: true })
  })
})
