import { createQrPayload } from '../domain/attendanceQr.js'
import { normalizeSessionTimes } from '../domain/attendanceSession.js'
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

export function createAttendanceService({ repository, env }) {
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
  }
}