import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp, sessionItem, teacherUser } from '../../test/fixtures'
import { API_BASE_URL, server } from '../../test/server'
import { formatSchoolDateLong, todaySchoolDate } from '../../lib/dateTime'
import { buildWeekStrip } from '../../lib/scheduleDates'

const today = todaySchoolDate()
const other = buildWeekStrip(today).find((item) => item.iso !== today)

function isoAt(iso, time) {
  return `${iso}T${time}:00.000Z`
}

function sessionOn(iso, overrides) {
  return sessionItem({
    sessionDate: `${iso}T00:00:00.000Z`,
    startAt: isoAt(iso, '01:00'),
    endAt: isoAt(iso, '02:30'),
    ...overrides,
  })
}

function dateButtonLabel(iso) {
  return formatSchoolDateLong(new Date(`${iso}T12:00:00Z`))
}

function renderDashboard(items) {
  server.use(
    http.get(`${API_BASE_URL}/me`, () =>
      HttpResponse.json({ data: { user: teacherUser } }),
    ),
    http.get(`${API_BASE_URL}/attendance-sessions`, () =>
      HttpResponse.json({ data: items }),
    ),
  )
  renderApp(['/app/teacher'])
}

describe('beranda guru', () => {
  it('menampilkan jadwal hari ini tanpa ikon mapel', async () => {
    renderDashboard([
      sessionOn(today, { id: 10, className: 'XII IPA 1', subjectName: 'Matematika' }),
    ])

    expect(
      await screen.findByRole('heading', { name: 'Beranda Guru' }),
    ).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /Hari ini/ })).toBeInTheDocument()

    const classNames = await screen.findAllByText('XII IPA 1')
    expect(classNames.length).toBeGreaterThan(0)
    expect(screen.getAllByText('Matematika').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Lihat QR').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Kehadiran').length).toBeGreaterThan(0)

    const card = classNames[0].closest('article')
    expect(card.querySelector('svg')).toBeNull()
  })

  it('memfilter daftar saat tanggal lain diklik', async () => {
    const user = userEvent.setup()
    renderDashboard([
      sessionOn(today, { id: 10, className: 'XII IPA 1' }),
      sessionOn(other.iso, { id: 11, className: 'XII IPA 2' }),
    ])

    expect((await screen.findAllByText('XII IPA 1')).length).toBeGreaterThan(0)
    expect(screen.queryAllByText('XII IPA 2')).toHaveLength(0)

    await user.click(
      screen.getByRole('button', { name: dateButtonLabel(other.iso) }),
    )

    expect((await screen.findAllByText('XII IPA 2')).length).toBeGreaterThan(0)
    expect(screen.queryAllByText('XII IPA 1')).toHaveLength(0)
  })

  it('kembali ke tanggal hari ini lewat tombol "Hari ini"', async () => {
    const user = userEvent.setup()
    renderDashboard([
      sessionOn(today, { id: 10, className: 'XII IPA 1' }),
      sessionOn(other.iso, { id: 11, className: 'XII IPA 2' }),
    ])

    await screen.findAllByText('XII IPA 1')
    expect(screen.queryByRole('button', { name: 'Hari ini' })).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: dateButtonLabel(other.iso) }),
    )
    await screen.findAllByText('XII IPA 2')

    await user.click(screen.getByRole('button', { name: 'Hari ini' }))

    expect((await screen.findAllByText('XII IPA 1')).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Hari ini' })).not.toBeInTheDocument()
  })

  it('menampilkan empty state pada tanggal tanpa sesi', async () => {
    const user = userEvent.setup()
    renderDashboard([sessionOn(today, { id: 10, className: 'XII IPA 1' })])

    await screen.findAllByText('XII IPA 1')
    await user.click(
      screen.getByRole('button', { name: dateButtonLabel(other.iso) }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Tidak ada jadwal pada tanggal ini',
      }),
    ).toBeInTheDocument()
  })

  it('memilih tanggal lewat dialog "Lebih lengkap"', async () => {
    const user = userEvent.setup()
    renderDashboard([
      sessionOn(today, { id: 10, className: 'XII IPA 1' }),
      sessionOn(other.iso, { id: 11, className: 'XII IPA 2' }),
    ])

    await screen.findAllByText('XII IPA 1')
    await user.click(screen.getByRole('button', { name: 'Lebih lengkap' }))

    const input = await screen.findByLabelText('Tanggal')
    fireEvent.change(input, { target: { value: other.iso } })

    expect((await screen.findAllByText('XII IPA 2')).length).toBeGreaterThan(0)
  })
})
