import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp, sessionItem, teacherUser } from '../../test/fixtures'
import { API_BASE_URL, server } from '../../test/server'

const SESSIONS_URL = `${API_BASE_URL}/attendance-sessions`
const ROSTER_URL = `${API_BASE_URL}/attendance-sessions/10/roster`
const EXPORT_URL = `${API_BASE_URL}/reports/attendance/export`

const ROSTER = {
  session: {
    id: 10,
    classId: 30,
    className: 'XII IPA 1',
    subjectId: 40,
    subjectName: 'Matematika',
    sessionDate: '2026-09-16T00:00:00.000Z',
    startAt: '2026-09-16T01:00:00.000Z',
    endAt: '2026-09-16T02:00:00.000Z',
  },
  students: [
    {
      studentId: 1,
      studentName: 'Siswa Demo',
      studentNumber: 'S-0001',
      status: 'HADIR',
      source: 'SCAN',
      scanned: true,
      scannedAt: '2026-09-16T01:05:00.000Z',
      lateMinutes: 0,
    },
    {
      studentId: 4,
      studentName: 'Siswa Lain',
      studentNumber: 'S-0002',
      status: 'IZIN',
      source: 'OVERRIDE',
      scanned: false,
      scannedAt: null,
      lateMinutes: 0,
    },
    {
      studentId: 5,
      studentName: 'Siswa Ketiga',
      studentNumber: 'S-0003',
      status: null,
      source: 'NONE',
      scanned: false,
      scannedAt: null,
      lateMinutes: 0,
    },
  ],
  summary: {
    hadir: 1,
    terlambat: 0,
    izin: 1,
    sakit: 0,
    alfa: 0,
    dispen: 0,
    tidakHadir: 0,
    h: 1,
  },
}

function renderAttendance(handlers = []) {
  server.use(
    http.get(`${API_BASE_URL}/me`, () =>
      HttpResponse.json({ data: { user: teacherUser } }),
    ),
    http.get(SESSIONS_URL, () =>
      HttpResponse.json({ data: [sessionItem({ id: 10, classId: 30 })] }),
    ),
    http.get(ROSTER_URL, () => HttpResponse.json({ data: ROSTER })),
    ...handlers,
  )
  renderApp(['/app/teacher/classes/30/attendance'])
}

describe('halaman kehadiran kelas guru', () => {
  it('menampilkan daftar siswa dan ringkasan status per sesi', async () => {
    renderAttendance()

    expect(await screen.findByText('Siswa Demo')).toBeInTheDocument()
    expect(screen.getByText('Siswa Lain')).toBeInTheDocument()
    expect(screen.getByText('Siswa Ketiga')).toBeInTheDocument()
    expect(screen.getAllByText('Hadir').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Izin').length).toBeGreaterThan(0)
  })

  it('mengunci status siswa yang sudah scan dan membiarkan siswa lain diubah', async () => {
    renderAttendance()

    await screen.findByText('Siswa Demo')
    expect(
      screen.getByRole('button', { name: 'Status Hadir untuk Siswa Demo' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Tandai Sakit untuk Siswa Demo' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Tandai Izin untuk Siswa Demo' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Tandai Sakit untuk Siswa Ketiga' }),
    ).toBeEnabled()
  })

  it('mengirim status manual saat tombol huruf diklik', async () => {
    const user = userEvent.setup()
    const overrideRequests = []
    renderAttendance([
      http.post(`${API_BASE_URL}/attendance-status-overrides`, async ({ request }) => {
        overrideRequests.push(await request.json())
        return HttpResponse.json({
          data: { id: 1, sessionId: 10, studentId: 5, status: 'SAKIT' },
        })
      }),
    ])

    await screen.findByText('Siswa Ketiga')
    await user.click(
      screen.getByRole('button', { name: 'Tandai Sakit untuk Siswa Ketiga' }),
    )

    expect(overrideRequests).toEqual([
      { sessionId: 10, studentId: 5, status: 'SAKIT' },
    ])
  })

  it('menyegarkan roster sehingga status manual langsung terlihat', async () => {
    const user = userEvent.setup()
    let rosterCalls = 0
    const updated = {
      ...ROSTER,
      students: [
        ROSTER.students[0],
        ROSTER.students[1],
        { ...ROSTER.students[2], status: 'SAKIT', source: 'OVERRIDE' },
      ],
    }
    server.use(
      http.get(`${API_BASE_URL}/me`, () =>
        HttpResponse.json({ data: { user: teacherUser } }),
      ),
      http.get(SESSIONS_URL, () =>
        HttpResponse.json({ data: [sessionItem({ id: 10, classId: 30 })] }),
      ),
      http.get(ROSTER_URL, () => {
        rosterCalls += 1
        return HttpResponse.json({ data: rosterCalls === 1 ? ROSTER : updated })
      }),
      http.post(`${API_BASE_URL}/attendance-status-overrides`, () =>
        HttpResponse.json({
          data: { id: 1, sessionId: 10, studentId: 5, status: 'SAKIT' },
        }),
      ),
    )
    renderApp(['/app/teacher/classes/30/attendance'])

    await screen.findByText('Siswa Ketiga')
    await user.click(
      screen.getByRole('button', { name: 'Tandai Sakit untuk Siswa Ketiga' }),
    )

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Tandai Sakit untuk Siswa Ketiga' }),
      ).toHaveAttribute('aria-pressed', 'true'),
    )
    expect(rosterCalls).toBeGreaterThan(1)
  })

  it('membuka dialog detail scan saat tombol Detail diklik', async () => {
    const user = userEvent.setup()
    renderAttendance()

    await screen.findByText('Siswa Demo')
    await user.click(screen.getAllByRole('button', { name: 'Detail' })[0])

    expect(await screen.findByText('Tanggal sesi')).toBeInTheDocument()
    expect(screen.getByText('Jam scan')).toBeInTheDocument()
  })

  it('mengunduh export XLSX dengan scope kelas', async () => {
    const user = userEvent.setup()
    let exportUrl = ''
    renderAttendance([
      http.get(EXPORT_URL, ({ request }) => {
        exportUrl = request.url
        return new HttpResponse(new Blob(['xlsx']), {
          status: 200,
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition':
              'attachment; filename="laporan-kehadiran-20260911-20260917.xlsx"',
          },
        })
      }),
    ])

    await screen.findByText('Siswa Demo')
    await user.click(screen.getByRole('button', { name: 'Export XLSX' }))

    expect(
      await screen.findByText('Laporan kehadiran sedang diunduh.'),
    ).toBeInTheDocument()
    expect(new URL(exportUrl).searchParams.get('classId')).toBe('30')
  })
})
