import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp, teacherUser } from '../../test/fixtures'
import { API_BASE_URL, server } from '../../test/server'

const DAILY = {
  date: '2026-09-16',
  sessions: [],
  absent: [
    {
      id: 'computed-10-1',
      sessionId: 10,
      studentId: 1,
      studentName: 'Siswa Demo',
      studentNumber: 'S-0001',
      classId: 30,
      className: 'XII IPA 1',
      subjectId: 40,
      subjectName: 'Matematika',
      status: 'TIDAK_HADIR',
      lateMinutes: 0,
      source: 'COMPUTED',
    },
  ],
  summary: { hadir: 1, terlambat: 0, izin: 0, sakit: 0, alfa: 0, dispen: 0, tidakHadir: 1 },
}

const SUMMARY = {
  items: [
    {
      studentId: 1,
      studentName: 'Siswa Demo',
      studentNumber: 'S-0001',
      classId: 30,
      className: 'XII IPA 1',
      totalMeetings: 4,
      hadir: 2,
      terlambat: 1,
      izin: 1,
      sakit: 0,
      alfa: 0,
      dispen: 0,
      tidakHadir: 0,
      h: 3,
    },
  ],
  summary: { hadir: 2, terlambat: 1, izin: 1, sakit: 0, alfa: 0, dispen: 0, tidakHadir: 0, h: 3 },
  meta: { totalStudents: 1, totalSessions: 4 },
}

function renderRecaps() {
  server.use(
    http.get(`${API_BASE_URL}/me`, () =>
      HttpResponse.json({ data: { user: teacherUser } }),
    ),
    http.get(`${API_BASE_URL}/reports/attendance/daily`, () =>
      HttpResponse.json({ data: DAILY }),
    ),
    http.get(`${API_BASE_URL}/reports/attendance/summary`, () =>
      HttpResponse.json({ data: SUMMARY }),
    ),
  )
  renderApp(['/app/teacher/reports'])
}

describe('halaman rekap guru', () => {
  it('menampilkan rekap harian dan mengirim status manual guru', async () => {
    const user = userEvent.setup()
    const overrideRequests = []
    server.use(
      http.post(`${API_BASE_URL}/attendance-status-overrides`, async ({ request }) => {
        overrideRequests.push(await request.json())
        return HttpResponse.json({
          data: { id: 1, sessionId: 10, studentId: 1, status: 'SAKIT' },
        })
      }),
    )
    renderRecaps()

    expect(await screen.findByText('Siswa Demo')).toBeInTheDocument()
    expect(screen.getAllByText('Tidak Hadir').length).toBeGreaterThan(0)

    await user.selectOptions(screen.getByRole('combobox'), 'SAKIT')
    await waitFor(() =>
      expect(overrideRequests).toEqual([
        { sessionId: 10, studentId: 1, status: 'SAKIT' },
      ]),
    )
  })

  it('menampilkan rekap keseluruhan dalam format H.I.S.A.D', async () => {
    const user = userEvent.setup()
    renderRecaps()

    await screen.findByText('Siswa Demo')
    await user.click(screen.getByRole('tab', { name: 'Keseluruhan' }))

    const table = await screen.findByRole('table')
    expect(table).toBeInTheDocument()
    const headers = screen.getAllByRole('columnheader').map((cell) => cell.textContent)
    expect(headers).toEqual(
      expect.arrayContaining(['Nama siswa', 'Pertemuan', 'H', 'I', 'S', 'A', 'D']),
    )
    expect(screen.getByText('S-0001')).toBeInTheDocument()
  })
})
