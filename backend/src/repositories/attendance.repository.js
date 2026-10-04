export function createAttendanceRepository(prisma) {
  const buildReportWhere = ({ user, query, studentId, classId }) => {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    return {
      ...(from || to
        ? {
            sessionDate: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
      deletedAt: null,
      ...(classId ? { classId } : {}),
      ...(query.assignmentId ? { assignmentId: query.assignmentId } : {}),
      ...(user.role === "TEACHER"
        ? { assignment: { teacherId: user.id, isActive: true } }
        : {}),
      ...(studentId
        ? { class: { memberships: { some: { studentId, isActive: true } } } }
        : {}),
    };
  };

    const reportInclude = (studentId) => ({
    assignment: { include: { subject: true } },
    class: {
      include: {
        memberships: {
          where: { isActive: true },
          include: { student: { include: { studentProfile: true } } },
        },
      },
    },
    records: {
      ...(studentId ? { where: { studentId } } : {}),
      include: { student: { include: { studentProfile: true } } },
    },
    statusOverrides: {
      ...(studentId ? { where: { studentId } } : {}),
    },
  })

  const recapInclude = () => ({
    assignment: { include: { subject: true } },
    class: {
      include: {
        memberships: {
          where: { isActive: true },
          include: { student: { include: { studentProfile: true } } },
        },
      },
    },
    records: true,
    statusOverrides: true,
  })
;

  const listReportSessions = ({
    user,
    query,
    studentId,
    classId,
    paginate = true,
  }) => {
    const sessionWhere = buildReportWhere({ user, query, studentId, classId });
    const orderBy =
      query.sort === "scannedAt"
        ? { records: { _count: query.order } }
        : { [query.sort]: query.order };
    const args = {
      where: sessionWhere,
      include: reportInclude(studentId),
      orderBy,
      ...(paginate
        ? { skip: (query.page - 1) * query.limit, take: query.limit }
        : {}),
    };
    return Promise.all([
      prisma.attendanceSession.findMany(args),
      prisma.attendanceSession.count({ where: sessionWhere }),
    ]);
  };

  return {
    findTeacher(teacherId) {
      return prisma.user.findFirst({
        where: { id: teacherId, role: "TEACHER", deletedAt: null },
      });
    },
    findClass(classId) {
      return prisma.class.findUnique({ where: { id: classId } });
    },
    findSubject(subjectId) {
      return prisma.subject.findUnique({ where: { id: subjectId } });
    },
    // Resolve penugasan (guru+kelas+mapel): pakai baris aktif bila ada,
    // aktifkan kembali arsip nonaktif, atau buat baru — semuanya dalam satu
    // transaksi sebelum sesi dibuat (D22/J2).
    resolveAssignment({ teacherId, classId, subjectId }) {
      const include = {
        class: true,
        subject: true,
        teacher: { select: { name: true } },
      };
      return prisma.$transaction(async (transaction) => {
        const active = await transaction.teacherAssignment.findFirst({
          where: { teacherId, classId, subjectId, isActive: true },
          include,
        });
        if (active) return active;
        const archived = await transaction.teacherAssignment.findFirst({
          where: { teacherId, classId, subjectId, isActive: false },
          include,
        });
        if (archived) {
          return transaction.teacherAssignment.update({
            where: { id: archived.id },
            data: { isActive: true },
            include,
          });
        }
        return transaction.teacherAssignment.create({
          data: { teacherId, classId, subjectId, isActive: true },
          include,
        });
      });
    },
    createSession(data) {
      return prisma.attendanceSession.create({
        data,
        include: {
          assignment: { include: { class: true, subject: true, teacher: { select: { name: true } } } },
          class: true,
        },
      });
    },
    listSessionsForTeacher(teacherId) {
      return prisma.attendanceSession.findMany({
        where: { deletedAt: null, assignment: { teacherId, isActive: true } },
        orderBy: [{ sessionDate: "desc" }, { startAt: "desc" }],
        include: {
          assignment: { include: { class: true, subject: true, teacher: { select: { name: true } } } },
          class: true,
        },
      });
    },
    listAllSessions() {
      return prisma.attendanceSession.findMany({
        where: { deletedAt: null },
        orderBy: [{ sessionDate: "desc" }, { startAt: "desc" }],
        include: {
          assignment: { include: { class: true, subject: true, teacher: { select: { name: true } } } },
          class: true,
        },
      });
    },
    findSessionForReader(id, user) {
      const where =
        user.role === "TEACHER"
          ? { id, deletedAt: null, assignment: { teacherId: user.id, isActive: true } }
          : { id, deletedAt: null };
      return prisma.attendanceSession.findFirst({
        where,
        include: {
          assignment: { include: { class: true, subject: true, teacher: { select: { name: true } } } },
          class: true,
        },
      });
    },
    updateSession(id, data) {
      return prisma.attendanceSession.update({
        where: { id },
        data,
        include: {
          assignment: { include: { class: true, subject: true, teacher: { select: { name: true } } } },
          class: true,
        },
      });
    },
    softDeleteSession(id) {
      return prisma.attendanceSession.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    },
    countSessionRecords(sessionId) {
      return prisma.attendanceRecord.count({ where: { sessionId } });
    },
    findSessionForScan(qrPayload) {
      return prisma.attendanceSession.findFirst({
        where: { qrPayload, deletedAt: null },
        include: { assignment: true },
      });
    },
    listTodaySessionsForStudent(studentId, sessionDate) {
      return prisma.attendanceSession.findMany({
        where: {
          sessionDate,
          deletedAt: null,
          assignment: { isActive: true },
          class: { memberships: { some: { studentId, isActive: true } } },
        },
        orderBy: [{ startAt: "asc" }],
        include: {
          assignment: {
            include: {
              subject: true,
              teacher: { select: { name: true } },
            },
          },
          class: true,
          records: { where: { studentId } },
        },
      });
    },
    findActiveMembership(classId, studentId) {
      return prisma.classStudent.findFirst({
        where: { classId, studentId, isActive: true },
      });
    },
    findSessionRoster(id, user) {
      const where =
        user.role === "TEACHER"
          ? { id, deletedAt: null, assignment: { teacherId: user.id, isActive: true } }
          : { id, deletedAt: null };
      return prisma.attendanceSession.findFirst({
        where,
        include: recapInclude(),
      });
    },
    listSessionsForRecap({ user, from, to, classId } = {}) {
      return prisma.attendanceSession.findMany({
        where: {
          deletedAt: null,
          ...(from || to
            ? {
                sessionDate: {
                  ...(from ? { gte: from } : {}),
                  ...(to ? { lte: to } : {}),
                },
              }
            : {}),
          ...(classId ? { classId } : {}),
          ...(user?.role === "TEACHER"
            ? { assignment: { teacherId: user.id, isActive: true } }
            : {}),
        },
        orderBy: [{ sessionDate: "desc" }, { startAt: "desc" }],
        include: recapInclude(),
      });
    },
    upsertStatusOverride({ sessionId, studentId, status, createdById }) {
      return prisma.attendanceStatusOverride.upsert({
        where: { sessionId_studentId: { sessionId, studentId } },
        create: { sessionId, studentId, status, createdBy: createdById },
        update: { status },
      });
    },
    deleteStatusOverride(sessionId, studentId) {
      return prisma.attendanceStatusOverride.delete({
        where: { sessionId_studentId: { sessionId, studentId } },
      });
    },
    createAttendanceRecord(data) {
      return prisma.$transaction((transaction) =>
        transaction.attendanceRecord.create({ data }),
      );
    },
    findAttendanceRecord(sessionId, studentId) {
      return prisma.attendanceRecord.findUnique({
        where: { sessionId_studentId: { sessionId, studentId } },
      });
    },
    listReportSessions(args) {
      return listReportSessions({ ...args, paginate: true });
    },
    listExportSessions(args) {
      return listReportSessions({ ...args, paginate: false }).then(
        ([sessions]) => sessions,
      );
    },
  };
}
