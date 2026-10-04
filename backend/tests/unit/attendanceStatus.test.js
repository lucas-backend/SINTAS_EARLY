import { describe, expect, it } from 'vitest'
import {
  AttendanceStatus,
  attendanceSessionSchema,
  attendanceSource,
  classifyAttendanceScan,
  resolveAttendanceStatus,
} from '../../src/domain/attendanceStatus.js'

const startAt = new Date('2026-09-17T08:00:00.000Z')
const endAt = new Date('2026-09-17T09:00:00.000Z')
const scanAt = (minutes, seconds = 0) => new Date(startAt.getTime() + minutes * 60 * 1000 + seconds * 1000)

describe('attendance domain', () => {
  it('exposes the attendance statuses', () => {
    expect(AttendanceStatus).toEqual({
      HADIR: 'HADIR',
      TERLAMBAT: 'TERLAMBAT',
      TIDAK_HADIR: 'TIDAK_HADIR',
      IZIN: 'IZIN',
      SAKIT: 'SAKIT',
      ALFA: 'ALFA',
      DISPEN: 'DISPEN',
    })
  })

  it('rejects a session whose end is not after its start', () => {
    expect(() => attendanceSessionSchema.parse({ startAt, endAt: startAt })).toThrow()
    expect(() => attendanceSessionSchema.parse({ startAt, endAt: new Date('2026-09-17T07:59:59.000Z') })).toThrow()
  })

  it('accepts the exact opening boundary at 15 minutes before start', () => {
    expect(classifyAttendanceScan({ startAt, endAt, scanAt: scanAt(-15) })).toEqual({
      status: AttendanceStatus.HADIR,
      lateMinutes: 0,
    })
  })

  it('accepts a scan at the session start as present', () => {
    expect(classifyAttendanceScan({ startAt, endAt, scanAt: scanAt(0) })).toEqual({
      status: AttendanceStatus.HADIR,
      lateMinutes: 0,
    })
  })

  it('keeps a scan just before and exactly at 15 minutes as present', () => {
    expect(classifyAttendanceScan({ startAt, endAt, scanAt: scanAt(14, 59) })).toEqual({
      status: AttendanceStatus.HADIR,
      lateMinutes: 0,
    })
    expect(classifyAttendanceScan({ startAt, endAt, scanAt: scanAt(15) })).toEqual({
      status: AttendanceStatus.HADIR,
      lateMinutes: 0,
    })
  })

  it('marks a scan after 15 minutes as late using the server scan time', () => {
    expect(classifyAttendanceScan({ startAt, endAt, scanAt: scanAt(16, 30) })).toEqual({
      status: AttendanceStatus.TERLAMBAT,
      lateMinutes: 16,
    })
  })

  it('accepts a scan exactly at end time and calculates lateness', () => {
    expect(classifyAttendanceScan({ startAt, endAt, scanAt: endAt })).toEqual({
      status: AttendanceStatus.TERLAMBAT,
      lateMinutes: 60,
    })
  })

  it('rejects scans before the window and after the session', () => {
    expect(() => classifyAttendanceScan({ startAt, endAt, scanAt: scanAt(-15, -1) })).toThrow(RangeError)
    expect(() => classifyAttendanceScan({ startAt, endAt, scanAt: new Date('2026-09-17T09:00:00.001Z') })).toThrow(RangeError)
  })

  it('lets the scan win over a manual override once the student scans', () => {
    const record = { status: AttendanceStatus.HADIR }
    const override = { status: AttendanceStatus.IZIN }
    expect(resolveAttendanceStatus({ record, override, sessionEnded: true })).toBe(
      AttendanceStatus.HADIR,
    )
    expect(attendanceSource({ record, override, status: AttendanceStatus.HADIR })).toBe(
      'SCAN',
    )
  })

  it('uses the manual override when the student has not scanned yet', () => {
    const override = { status: AttendanceStatus.SAKIT }
    expect(resolveAttendanceStatus({ override, sessionEnded: false })).toBe(
      AttendanceStatus.SAKIT,
    )
    expect(attendanceSource({ override, status: AttendanceStatus.SAKIT })).toBe(
      'OVERRIDE',
    )
  })

  it('computes TIDAK_HADIR only after the session ends without record/override', () => {
    expect(resolveAttendanceStatus({ sessionEnded: true })).toBe(
      AttendanceStatus.TIDAK_HADIR,
    )
    expect(resolveAttendanceStatus({ sessionEnded: false })).toBeNull()
  })
})