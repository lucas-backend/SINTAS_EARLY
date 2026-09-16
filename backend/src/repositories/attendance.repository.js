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
  }
}