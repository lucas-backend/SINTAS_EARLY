export function createAttendanceRepository(prisma) {
  return {
    findActiveAssignmentForTeacher(assignmentId, teacherId) {
      return prisma.teacherAssignment.findFirst({
        where: { id: assignmentId, teacherId, isActive: true },
        include: { class: true, subject: true },
      })
    },
    createSession(data) {
      return prisma.attendanceSession.create({
        data,
        include: { assignment: { include: { class: true, subject: true } }, class: true },
      })
    },
    listSessionsForTeacher(teacherId) {
      return prisma.attendanceSession.findMany({
        where: { assignment: { teacherId, isActive: true } },
        orderBy: [{ sessionDate: 'desc' }, { startAt: 'desc' }],
        include: { assignment: { include: { class: true, subject: true } }, class: true },
      })
    },
    listAllSessions() {
      return prisma.attendanceSession.findMany({
        orderBy: [{ sessionDate: 'desc' }, { startAt: 'desc' }],
        include: { assignment: { include: { class: true, subject: true } }, class: true },
      })
    },
    findSessionForReader(id, user) {
      const where = user.role === 'TEACHER' ? { id, assignment: { teacherId: user.id, isActive: true } } : { id }
      return prisma.attendanceSession.findFirst({
        where,
        include: { assignment: { include: { class: true, subject: true } }, class: true },
      })
    },
    findSessionForScan(qrPayload) {
      return prisma.attendanceSession.findUnique({
        where: { qrPayload },
        include: { assignment: true },
      })
    },
    findActiveMembership(classId, studentId) {
      return prisma.classStudent.findFirst({
        where: { classId, studentId, isActive: true },
      })
    },
    createAttendanceRecord(data) {
      return prisma.$transaction((transaction) => transaction.attendanceRecord.create({ data }))
    },
    findAttendanceRecord(sessionId, studentId) {
      return prisma.attendanceRecord.findUnique({
        where: { sessionId_studentId: { sessionId, studentId } },
      })
    },
    listReportSessions({ user, query, studentId, classId }) {
      const from = query.from ? new Date(query.from) : undefined
      const to = query.to ? new Date(query.to) : undefined
      const sessionWhere = {
        ...(from || to ? { sessionDate: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
        ...(classId ? { classId } : {}),
        ...(query.assignmentId ? { assignmentId: query.assignmentId } : {}),
        ...(user.role === 'TEACHER' ? { assignment: { teacherId: user.id, isActive: true } } : {}),
        ...(studentId ? { class: { memberships: { some: { studentId, isActive: true } } } } : {}),
      }
      const include = {
        assignment: { include: { subject: true } },
        class: { include: { memberships: { where: { isActive: true }, include: { student: { include: { studentProfile: true } } } } } },
        records: { ...(studentId ? { where: { studentId } } : {}), include: { student: { include: { studentProfile: true } } } },
      }
      const orderBy = query.sort === 'scannedAt' ? { records: { _count: query.order } } : { [query.sort]: query.order }
      const args = { where: sessionWhere, include, orderBy, skip: (query.page - 1) * query.limit, take: query.limit }
      return Promise.all([prisma.attendanceSession.findMany(args), prisma.attendanceSession.count({ where: sessionWhere })])
    },
  }
}