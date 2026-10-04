import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { attendanceKeys } from '../services/attendanceService'
import { clearUserScopedCache } from './queryClient'

describe('clearUserScopedCache', () => {
  it('menghapus cache jadwal/sesi dan kehadiran kelas milik user sebelumnya', () => {
    const client = new QueryClient()
    client.setQueryData(attendanceKeys.teacherSessions, [{ id: 1 }])
    client.setQueryData(attendanceKeys.adminSessions, [{ id: 1 }])
    client.setQueryData(attendanceKeys.sessionQr(1), { qrPayload: 'x' })
    client.setQueryData(attendanceKeys.classAttendance(30, {}), [])
    client.setQueryData(attendanceKeys.today, [])

    clearUserScopedCache(client)

    expect(client.getQueryData(attendanceKeys.teacherSessions)).toBeUndefined()
    expect(client.getQueryData(attendanceKeys.adminSessions)).toBeUndefined()
    expect(client.getQueryData(attendanceKeys.sessionQr(1))).toBeUndefined()
    expect(
      client.getQueryData(attendanceKeys.classAttendance(30, {})),
    ).toBeUndefined()
    expect(client.getQueryData(attendanceKeys.today)).toBeUndefined()
  })
})