import { createQrPayload } from '../domain/attendanceQr.js'
import { normalizeSessionTimes } from '../domain/attendanceSession.js'
import { classifyAttendanceScan } from '../domain/attendanceStatus.js'
import { isOpaqueQrPayload } from '../domain/attendanceQr.js'
import { AppError } from '../middleware/errorHandler.js'

const sessionMetadata = (session) => ({
  id: session.id,
  assignmentId: session.assignmentId,
  classId: session.classId,
  className: session.class?.name ?? session.assignment?.class?.name,
  subjectId: session.assignment?.subjectId,
  subjectName: session.assignment?.subject?.name,
  sessionDate: session.sessionDate,
  startAt: session.startAt,
  endAt: session.endAt,
  createdAt: session.createdAt,
})

function requireReader(user) {
  if (!['ADMIN', 'TEACHER'].includes(user.role)) throw new AppError(403, 'FORBIDDEN', 'Anda tidak memiliki akses ke sesi absensi.')
}

const scanMetadata = (record, duplicate = false) => ({
  id: record.id,
  sessionId: record.sessionId,
  scannedAt: record.scannedAt,
  status: record.status,
  lateMinutes: record.lateMinutes ?? 0,
  duplicate,
})

const reportMetadata = ({ session, student, record, status }) => ({
  id: record?.id ?? `computed-${session.id}-${student.id}`,
  sessionId: session.id,
  studentId: student.id,
  studentName: student.name,
  studentNumber: student.studentProfile?.studentNumber ?? null,
  sessionDate: session.sessionDate,
  classId: session.classId,
  className: session.class?.name,
  subjectId: session.assignment?.subjectId,
  subjectName: session.assignment?.subject?.name,
  startAt: session.startAt,
  endAt: session.endAt,
  scannedAt: record?.scannedAt ?? null,
  status,
  lateMinutes: record?.lateMinutes ?? 0,
})

const pageResult = (items, query, total) => ({ items, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } })

export function createAttendanceService({ repository, env, now = () => new Date() }) {
  return {
    async createSession(user, data) {
      if (user.role !== 'TEACHER') throw new AppError(403, 'FORBIDDEN', 'Hanya guru yang dapat membuat sesi absensi.')
      const assignment = await repository.findActiveAssignmentForTeacher(data.assignmentId, user.id)
      if (!assignment) throw new AppError(403, 'ASSIGNMENT_FORBIDDEN', 'Penugasan tidak aktif atau bukan milik Anda.')
      const times = normalizeSessionTimes(data, env.SCHOOL_TIMEZONE)
      try {
        const session = await repository.createSession({
          assignmentId: assignment.id,
          classId: assignment.classId,
          sessionDate: times.sessionDate,
          startAt: times.startAt,
          endAt: times.endAt,
          qrPayload: createQrPayload(),
          createdById: user.id,
        })
        return sessionMetadata(session)
      } catch (error) {
        if (error?.code === 'P2002') throw new AppError(409, 'DUPLICATE_ATTENDANCE_SESSION', 'Sesi absensi untuk pertemuan tersebut sudah ada.')
        throw error
      }
    },
    async listSessions(user) {
      requireReader(user)
      const sessions = user.role === 'ADMIN' ? await repository.listAllSessions() : await repository.listSessionsForTeacher(user.id)
      return sessions.map(sessionMetadata)
    },
    async getQr(user, id) {
      requireReader(user)
      const session = await repository.findSessionForReader(id, user)
      if (!session) throw new AppError(404, 'NOT_FOUND', 'Sesi absensi tidak ditemukan.')
      return { ...sessionMetadata(session), qrPayload: session.qrPayload }
    },
    async scan(user, data) {
      if (!isOpaqueQrPayload(data.qrPayload)) throw new AppError(400, 'INVALID_QR_PAYLOAD', 'QR Code tidak valid.')

      const session = await repository.findSessionForScan(data.qrPayload)
      if (!session) throw new AppError(404, 'ATTENDANCE_SESSION_NOT_FOUND', 'Sesi absensi tidak ditemukan.')
      if (!session.assignment?.isActive) throw new AppError(404, 'ATTENDANCE_SESSION_NOT_FOUND', 'Sesi absensi tidak ditemukan.')

      const membership = await repository.findActiveMembership(session.classId, user.id)
      if (!membership) throw new AppError(403, 'CLASS_MEMBERSHIP_REQUIRED', 'Anda bukan anggota kelas sesi ini.')

      const scannedAt = now()
      let attendance
      try {
        attendance = classifyAttendanceScan({ startAt: session.startAt, endAt: session.endAt, scanAt: scannedAt })
      } catch (error) {
        if (error instanceof RangeError) throw new AppError(409, 'ATTENDANCE_WINDOW_CLOSED', 'Sesi absensi belum dibuka atau sudah ditutup.')
        throw error
      }

      try {
        const record = await repository.createAttendanceRecord({
          sessionId: session.id,
          studentId: user.id,
          scannedAt,
          status: attendance.status,
          lateMinutes: attendance.lateMinutes,
        })
        return scanMetadata(record)
      } catch (error) {
        if (error?.code !== 'P2002') throw error
        const existing = await repository.findAttendanceRecord(session.id, user.id)
        if (!existing) throw error
        return scanMetadata(existing, true)
      }
    },
    async history(user, query) {
      if (user.role !== 'STUDENT') throw new AppError(403, 'FORBIDDEN', 'Hanya siswa yang dapat melihat riwayat pribadi.')
      return this.listReport(user, query, { studentId: user.id })
    },
    async classAttendance(user, query, classId) {
      if (user.role !== 'TEACHER') throw new AppError(403, 'FORBIDDEN', 'Hanya guru yang dapat melihat detail kehadiran kelas.')
      return this.listReport(user, query, { classId })
    },
    async globalReport(user, query) {
      if (user.role !== 'ADMIN') throw new AppError(403, 'FORBIDDEN', 'Hanya admin yang dapat melihat laporan global.')
      return this.listReport(user, query)
    },
    async listReport(user, query, scope = {}) {
      const reportQuery = { page: 1, limit: 20, sort: 'sessionDate', order: 'desc', ...query }
      const [sessions, total] = await repository.listReportSessions({ user, query: reportQuery, ...scope })
      const nowValue = now()
      const items = sessions.flatMap((session) => {
        const students = scope.studentId ? session.class.memberships.filter((membership) => membership.studentId === scope.studentId).map((membership) => membership.student) : session.class.memberships.map((membership) => membership.student)
        return students.flatMap((student) => {
          const record = session.records.find((value) => value.studentId === student.id)
          const status = record?.status ?? (nowValue > session.endAt ? 'TIDAK_HADIR' : null)
          if (!status || (reportQuery.status && reportQuery.status !== status)) return []
          return [reportMetadata({ session, student, record, status })]
        })
      })
      return pageResult(items, reportQuery, total)
    },
  }
}