import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp, adminUser } from '../../test/fixtures'
import { API_BASE_URL, server } from '../../test/server'

const SESSIONS_URL = `${API_BASE_URL}/attendance-sessions`
const CLASSES_URL = `${API_BASE_URL}/academic/classes`
const SUBJECTS_URL = `${API_BASE_URL}/academic/subjects`
const USERS_URL = `${API_BASE_URL}/users`

function page(items) {
  return {
    items,
    meta: { page: 1, limit: 100, total: items.length, totalPages: 1 },
  }
}

function session(overrides) {
  return {
    id: 10,
    assignmentId: 60,
    classId: 30,
    className: 'XII IPA 1',
    subjectId: 40,
    subjectName: 'Matematika',
    teacherId: 2,
    teacherName: 'Guru Demo',
    sessionDate: '2026-09-17T00:00:00.000Z',
    startAt: '2026-09-17T01:00:00.000Z',
    endAt: '2026-09-17T02:00:00.000Z',
    createdAt: '2026-09-16T02:00:00.000Z',
    ...overrides,
  }
}

function renderSessions(handlers) {
  server.use(
    http.get(`${API_BASE_URL}/me`, () =>
      HttpResponse.json({ data: { user: adminUser } }),
    ),
    http.get(CLASSES_URL, () =>
      HttpResponse.json({ data: page([{ id: 30, name: 'XII IPA 1' }]) }),
    ),
    http.get(SUBJECTS_URL, () =>
      HttpResponse.json({ data: page([{ id: 40, name: 'Matematika' }]) }),
    ),
    http.get(USERS_URL, () =>
      HttpResponse.json({ data: page([{ id: 2, name: 'Guru Demo', role: 'TEACHER', username: 'teacher.demo' }]) }),
    ),
    ...handlers,
  )
  renderApp(['/app/admin/sessions'])
}

describe('halaman sesi admin', () => {
  it('membuat jadwal dan mengirim payload kontrak', async () => {
    const user = userEvent.setup()
    let body = null
    renderSessions([
      http.get(SESSIONS_URL, () => HttpResponse.json({ data: [session()] })),
      http.post(SESSIONS_URL, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: session() })
      }),
    ])

    await screen.findAllByText('Matematika')
    await user.click(screen.getByRole('button', { name: 'Jadwal baru' }))

    const dialog = await screen.findByRole('dialog')
    await user.selectOptions(within(dialog).getByLabelText('Kelas'), '30')
    await user.selectOptions(within(dialog).getByLabelText('Mata pelajaran'), '40')
    await user.selectOptions(within(dialog).getByLabelText('Guru'), '2')
    await user.clear(within(dialog).getByLabelText('Tanggal'))
    await user.type(within(dialog).getByLabelText('Tanggal'), '2026-09-18')
    await user.type(within(dialog).getByLabelText('Jam mulai'), '08:00')
    await user.type(within(dialog).getByLabelText('Jam selesai'), '09:00')
    await user.click(within(dialog).getByRole('button', { name: 'Buat sesi' }))

    await waitFor(() => expect(body).not.toBeNull())
    expect(body).toEqual({
      classId: 30,
      subjectId: 40,
      teacherId: 2,
      sessionDate: '2026-09-18',
      startAt: '2026-09-18T08:00:00+07:00',
      endAt: '2026-09-18T09:00:00+07:00',
      timezone: 'Asia/Jakarta',
    })
  })

  it('mengubah sesi dan mengirim jadwal lengkap', async () => {
    const user = userEvent.setup()
    let body = null
    renderSessions([
      http.get(SESSIONS_URL, () => HttpResponse.json({ data: [session()] })),
      http.patch(`${SESSIONS_URL}/10`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: session() })
      }),
    ])

    await screen.findAllByText('Matematika')
    await user.click(screen.getAllByRole('button', { name: 'Ubah' })[0])

    const dialog = await screen.findByRole('dialog')
    const end = within(dialog).getByLabelText('Jam selesai')
    await user.clear(end)
    await user.type(end, '10:00')
    await user.click(within(dialog).getByRole('button', { name: 'Simpan perubahan' }))

    await waitFor(() => expect(body).not.toBeNull())
    expect(body).toEqual({
      classId: 30,
      subjectId: 40,
      teacherId: 2,
      sessionDate: '2026-09-17',
      startAt: '2026-09-17T08:00:00+07:00',
      endAt: '2026-09-17T10:00:00+07:00',
      timezone: 'Asia/Jakarta',
    })
  })

  it('menghapus sesi setelah konfirmasi', async () => {
    const user = userEvent.setup()
    let deleteCount = 0
    renderSessions([
      http.get(SESSIONS_URL, () => HttpResponse.json({ data: [session()] })),
      http.delete(`${SESSIONS_URL}/10`, () => {
        deleteCount += 1
        return HttpResponse.json({ data: session() })
      }),
    ])

    await screen.findAllByText('Matematika')
    await user.click(screen.getAllByRole('button', { name: 'Hapus' })[0])

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Hapus' }))

    await waitFor(() => expect(deleteCount).toBe(1))
  })
})
