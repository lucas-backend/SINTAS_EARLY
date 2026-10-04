import { createQrPayload } from "../domain/attendanceQr.js";
import { normalizeSessionTimes, localDate } from "../domain/attendanceSession.js";
import {
  classifyAttendanceScan,
  classifyScheduleItem,
  resolveAttendanceStatus,
  attendanceSource,
  isPresentStatus,
} from "../domain/attendanceStatus.js";
import { isOpaqueQrPayload } from "../domain/attendanceQr.js";
import { AppError } from "../middleware/errorHandler.js";
import ExcelJS from "exceljs";

const sessionMetadata = (session) => ({
  id: session.id,
  assignmentId: session.assignmentId,
  classId: session.classId,
  className: session.class?.name ?? session.assignment?.class?.name,
  subjectId: session.assignment?.subjectId,
  subjectName: session.assignment?.subject?.name,
  teacherId: session.assignment?.teacherId,
  teacherName: session.assignment?.teacher?.name ?? null,
  sessionDate: session.sessionDate,
  startAt: session.startAt,
  endAt: session.endAt,
  createdAt: session.createdAt,
});

const requireAssignmentTargets = async (repository, { classId, subjectId, teacherId }) => {
  const [teacher, klass, subject] = await Promise.all([
    repository.findTeacher(teacherId),
    repository.findClass(classId),
    repository.findSubject(subjectId),
  ]);
  if (!teacher) throw new AppError(404, "NOT_FOUND", "Guru tidak ditemukan.");
  if (!klass) throw new AppError(404, "NOT_FOUND", "Kelas tidak ditemukan.");
  if (!subject)
    throw new AppError(404, "NOT_FOUND", "Mata pelajaran tidak ditemukan.");
};

function requireReader(user) {
  if (!["ADMIN", "TEACHER"].includes(user.role))
    throw new AppError(
      403,
      "FORBIDDEN",
      "Anda tidak memiliki akses ke sesi absensi.",
    );
}

const scanMetadata = (record, duplicate = false) => ({
  id: record.id,
  sessionId: record.sessionId,
  scannedAt: record.scannedAt,
  status: record.status,
  lateMinutes: record.lateMinutes ?? 0,
  duplicate,
});

const scheduleItem = (session, schedule) => ({
  id: session.id,
  assignmentId: session.assignmentId,
  classId: session.classId,
  className: session.class?.name,
  subjectId: session.assignment?.subjectId,
  subjectName: session.assignment?.subject?.name,
  teacherName: session.assignment?.teacher?.name ?? null,
  sessionDate: session.sessionDate,
  startAt: session.startAt,
  endAt: session.endAt,
  createdAt: session.createdAt,
  windowStatus: schedule.windowStatus,
  attendanceStatus: schedule.attendanceStatus,
  scanned: schedule.scanned,
});

const reportMetadata = ({ session, student, record, status, override = null }) => ({
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
  source: attendanceSource({ record, override, status }),
  lateMinutes: record?.lateMinutes ?? 0,
});

const pageResult = (items, query, total) => ({
  items,
  meta: {
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  },
});
const exportHeaders = [
  "Tanggal sesi",
  "Kelas",
  "Mata pelajaran",
  "Nama siswa",
  "NIM",
  "Status",
  "Menit terlambat",
  "Waktu scan",
];
const exportConcurrency = { active: 0, limit: 2 };

async function acquireExportSlot() {
  if (exportConcurrency.active >= exportConcurrency.limit)
    throw new AppError(
      429,
      "EXPORT_BUSY",
      "Terlalu banyak export sedang diproses. Silakan coba lagi nanti.",
    );
  exportConcurrency.active += 1;
}

function releaseExportSlot() {
  exportConcurrency.active -= 1;
}

function formatSchoolDate(value, timezone) {
  if (!value) return "";
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: timezone,
    dateStyle: "short",
    timeStyle: "medium",
  }).format(value);
}

function exportFileName(query) {
  const from = query.from
    ? new Date(query.from).toISOString().slice(0, 10).replaceAll("-", "")
    : "awal";
  const to = query.to
    ? new Date(query.to).toISOString().slice(0, 10).replaceAll("-", "")
    : "akhir";
  return `laporan-kehadiran-${from}-${to}.xlsx`;
}

const STATUS_SUMMARY_KEYS = Object.freeze({
  HADIR: "hadir",
  TERLAMBAT: "terlambat",
  IZIN: "izin",
  SAKIT: "sakit",
  ALFA: "alfa",
  DISPEN: "dispen",
  TIDAK_HADIR: "tidakHadir",
});

function emptySummary() {
  return {
    hadir: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    alfa: 0,
    dispen: 0,
    tidakHadir: 0,
    h: 0,
  };
}

function addToSummary(summary, status) {
  const key = STATUS_SUMMARY_KEYS[status];
  if (key) summary[key] += 1;
}

function resolveMemberStatus(session, student, nowValue) {
  const record =
    session.records.find((value) => value.studentId === student.id) ?? null;
  const override =
    session.statusOverrides?.find(
      (value) => value.studentId === student.id,
    ) ?? null;
  const status = resolveAttendanceStatus({
    record,
    override,
    sessionEnded: nowValue > session.endAt,
  });
  return { record, override, status };
}

function rosterPayload(session, nowValue) {
  const students = session.class.memberships.map(({ student }) => {
    const { record, override, status } = resolveMemberStatus(
      session,
      student,
      nowValue,
    );
    return {
      studentId: student.id,
      studentName: student.name,
      studentNumber: student.studentProfile?.studentNumber ?? null,
      status,
      source: attendanceSource({ record, override, status }),
      scanned: Boolean(record),
      scannedAt: record?.scannedAt ?? null,
      lateMinutes: record?.lateMinutes ?? 0,
    };
  });
  const summary = emptySummary();
  students.forEach((entry) => addToSummary(summary, entry.status));
  return { session: sessionMetadata(session), students, summary };
}

export function createAttendanceService({
  repository,
  env,
  now = () => new Date(),
}) {
  return {
    async createSession(user, data) {
      if (user.role !== "ADMIN")
        throw new AppError(
          403,
          "FORBIDDEN",
          "Hanya admin yang dapat membuat jadwal absensi.",
        );
      await requireAssignmentTargets(repository, data);
      const times = normalizeSessionTimes(data, env.SCHOOL_TIMEZONE);
      const assignment = await repository.resolveAssignment({
        teacherId: data.teacherId,
        classId: data.classId,
        subjectId: data.subjectId,
      });
      try {
        const session = await repository.createSession({
          assignmentId: assignment.id,
          classId: assignment.classId,
          sessionDate: times.sessionDate,
          startAt: times.startAt,
          endAt: times.endAt,
          qrPayload: createQrPayload(),
          createdById: user.id,
        });
        return sessionMetadata(session);
      } catch (error) {
        if (error?.code === "P2002")
          throw new AppError(
            409,
            "DUPLICATE_ATTENDANCE_SESSION",
            "Sesi absensi untuk pertemuan tersebut sudah ada.",
          );
        throw error;
      }
    },
    async updateSession(user, id, data) {
      if (user.role !== "ADMIN")
        throw new AppError(
          403,
          "FORBIDDEN",
          "Hanya admin yang dapat mengubah sesi absensi.",
        );
      const session = await repository.findSessionForReader(id, user);
      if (!session)
        throw new AppError(404, "NOT_FOUND", "Sesi absensi tidak ditemukan.");
      if ((await repository.countSessionRecords(id)) > 0)
        throw new AppError(
          409,
          "SESSION_HAS_RECORDS",
          "Sesi yang sudah memiliki kehadiran tidak dapat diubah.",
        );
      const hasAssignmentChange = data.teacherId !== undefined;
      const scheduleProvided = data.startAt !== undefined;
      const target = {};
      if (hasAssignmentChange) {
        await requireAssignmentTargets(repository, data);
        const assignment = await repository.resolveAssignment({
          teacherId: data.teacherId,
          classId: data.classId,
          subjectId: data.subjectId,
        });
        target.assignmentId = assignment.id;
        target.classId = assignment.classId;
      }
      if (scheduleProvided) {
        const times = normalizeSessionTimes(data, env.SCHOOL_TIMEZONE);
        target.sessionDate = times.sessionDate;
        target.startAt = times.startAt;
        target.endAt = times.endAt;
      }
      if (Object.keys(target).length === 0)
        throw new AppError(400, "VALIDATION_ERROR", "Tidak ada perubahan yang dikirim.");
      try {
        const updated = await repository.updateSession(id, target);
        return sessionMetadata(updated);
      } catch (error) {
        if (error?.code === "P2002")
          throw new AppError(
            409,
            "DUPLICATE_ATTENDANCE_SESSION",
            "Sesi absensi untuk pertemuan tersebut sudah ada.",
          );
        throw error;
      }
    },
    async deleteSession(user, id) {
      if (user.role !== "ADMIN")
        throw new AppError(
          403,
          "FORBIDDEN",
          "Hanya admin yang dapat menghapus sesi absensi.",
        );
      const session = await repository.findSessionForReader(id, user);
      if (!session)
        throw new AppError(404, "NOT_FOUND", "Sesi absensi tidak ditemukan.");
      if ((await repository.countSessionRecords(id)) > 0)
        throw new AppError(
          409,
          "SESSION_HAS_RECORDS",
          "Sesi yang sudah memiliki kehadiran tidak dapat dihapus.",
        );
      await repository.softDeleteSession(id);
      return sessionMetadata(session);
    },
    async listSessions(user) {
      requireReader(user);
      const sessions =
        user.role === "ADMIN"
          ? await repository.listAllSessions()
          : await repository.listSessionsForTeacher(user.id);
      return sessions.map(sessionMetadata);
    },
    async getQr(user, id) {
      requireReader(user);
      const session = await repository.findSessionForReader(id, user);
      if (!session)
        throw new AppError(404, "NOT_FOUND", "Sesi absensi tidak ditemukan.");
      return { ...sessionMetadata(session), qrPayload: session.qrPayload };
    },
    async todaySchedule(user) {
      if (user.role !== "STUDENT")
        throw new AppError(
          403,
          "FORBIDDEN",
          "Hanya siswa yang dapat melihat jadwal hari ini.",
        );
      const nowValue = now();
      const { year, month, day } = localDate(
        nowValue,
        env.SCHOOL_TIMEZONE,
      );
      const sessionDate = new Date(
        `${year}-${month}-${day}T00:00:00.000Z`,
      );
      const sessions = await repository.listTodaySessionsForStudent(
        user.id,
        sessionDate,
      );
      return sessions.map((session) =>
        scheduleItem(
          session,
          classifyScheduleItem({
            startAt: session.startAt,
            endAt: session.endAt,
            now: nowValue,
            record: session.records?.[0] ?? null,
          }),
        ),
      );
    },
    async scan(user, data) {
      if (!isOpaqueQrPayload(data.qrPayload))
        throw new AppError(400, "INVALID_QR_PAYLOAD", "QR Code tidak valid.");

      const session = await repository.findSessionForScan(data.qrPayload);
      if (!session)
        throw new AppError(
          404,
          "ATTENDANCE_SESSION_NOT_FOUND",
          "Sesi absensi tidak ditemukan.",
        );
      if (!session.assignment?.isActive)
        throw new AppError(
          404,
          "ATTENDANCE_SESSION_NOT_FOUND",
          "Sesi absensi tidak ditemukan.",
        );

      const membership = await repository.findActiveMembership(
        session.classId,
        user.id,
      );
      if (!membership)
        throw new AppError(
          403,
          "CLASS_MEMBERSHIP_REQUIRED",
          "Anda bukan anggota kelas sesi ini.",
        );

      const scannedAt = now();
      let attendance;
      try {
        attendance = classifyAttendanceScan({
          startAt: session.startAt,
          endAt: session.endAt,
          scanAt: scannedAt,
        });
      } catch (error) {
        if (error instanceof RangeError)
          throw new AppError(
            409,
            "ATTENDANCE_WINDOW_CLOSED",
            "Sesi absensi belum dibuka atau sudah ditutup.",
          );
        throw error;
      }

      try {
        const record = await repository.createAttendanceRecord({
          sessionId: session.id,
          studentId: user.id,
          scannedAt,
          status: attendance.status,
          lateMinutes: attendance.lateMinutes,
        });
        return scanMetadata(record);
      } catch (error) {
        if (error?.code !== "P2002") throw error;
        const existing = await repository.findAttendanceRecord(
          session.id,
          user.id,
        );
        if (!existing) throw error;
        return scanMetadata(existing, true);
      }
    },
    async history(user, query) {
      if (user.role !== "STUDENT")
        throw new AppError(
          403,
          "FORBIDDEN",
          "Hanya siswa yang dapat melihat riwayat pribadi.",
        );
      return this.listReport(user, query, { studentId: user.id });
    },
    async classAttendance(user, query, classId) {
      if (user.role !== "TEACHER")
        throw new AppError(
          403,
          "FORBIDDEN",
          "Hanya guru yang dapat melihat detail kehadiran kelas.",
        );
      return this.listReport(user, query, { classId });
    },
    async globalReport(user, query) {
      if (user.role !== "ADMIN")
        throw new AppError(
          403,
          "FORBIDDEN",
          "Hanya admin yang dapat melihat laporan global.",
        );
      return this.listReport(user, query);
    },
    async exportReport(user, query) {
      if (!["ADMIN", "TEACHER"].includes(user.role))
        throw new AppError(
          403,
          "FORBIDDEN",
          "Anda tidak memiliki akses export laporan.",
        );
      await acquireExportSlot();
      try {
        const reportQuery = {
          page: 1,
          limit: 100,
          sort: "sessionDate",
          order: "desc",
          ...query,
        };
        const sessions = await repository.listExportSessions({
          user,
          query: reportQuery,
          classId: user.role === "TEACHER" ? query.classId : undefined,
        });
        const rows = sessions.flatMap((session) =>
          session.class.memberships.flatMap(({ student }) => {
            const record = session.records.find(
              (value) => value.studentId === student.id,
            );
            const override =
              session.statusOverrides?.find(
                (value) => value.studentId === student.id,
              ) ?? null;
            const status = resolveAttendanceStatus({
              record,
              override,
              sessionEnded: now() > session.endAt,
            });
            if (
              !status ||
              (reportQuery.status && reportQuery.status !== status)
            )
              return [];
            return [reportMetadata({ session, student, record, status, override })];
          }),
        );
        if (rows.length === 0)
          throw new AppError(
            404,
            "NO_DATA_TO_EXPORT",
            "Tidak ada data untuk diekspor.",
          );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Kehadiran");
        worksheet.columns = exportHeaders.map((header) => ({
          header,
          key: header,
          width: Math.max(header.length + 2, 18),
        }));
        rows.forEach((row) =>
          worksheet.addRow({
            [exportHeaders[0]]: formatSchoolDate(
              row.sessionDate,
              env.SCHOOL_TIMEZONE,
            ),
            [exportHeaders[1]]: row.className,
            [exportHeaders[2]]: row.subjectName,
            [exportHeaders[3]]: row.studentName,
            [exportHeaders[4]]: row.studentNumber,
            [exportHeaders[5]]: row.status,
            [exportHeaders[6]]: row.lateMinutes,
            [exportHeaders[7]]: formatSchoolDate(
              row.scannedAt,
              env.SCHOOL_TIMEZONE,
            ),
          }),
        );
        worksheet.getRow(1).font = { bold: true };
        return {
          buffer: await workbook.xlsx.writeBuffer(),
          fileName: exportFileName(reportQuery),
        };
      } finally {
        releaseExportSlot();
      }
    },
    async listReport(user, query, scope = {}) {
      const reportQuery = {
        page: 1,
        limit: 20,
        sort: "sessionDate",
        order: "desc",
        ...query,
      };
      const [sessions, total] = await repository.listReportSessions({
        user,
        query: reportQuery,
        ...scope,
      });
      const nowValue = now();
      const items = sessions.flatMap((session) => {
        const students = scope.studentId
          ? session.class.memberships
              .filter((membership) => membership.studentId === scope.studentId)
              .map((membership) => membership.student)
          : session.class.memberships.map((membership) => membership.student);
        return students.flatMap((student) => {
          const record = session.records.find(
            (value) => value.studentId === student.id,
          );
          const override =
            session.statusOverrides?.find(
              (value) => value.studentId === student.id,
            ) ?? null;
          const status = resolveAttendanceStatus({
            record,
            override,
            sessionEnded: nowValue > session.endAt,
          });
          if (!status || (reportQuery.status && reportQuery.status !== status))
            return [];
          return [reportMetadata({ session, student, record, status, override })];
        });
      });
      return pageResult(items, reportQuery, total);
    },
    async setStatusOverride(user, { sessionId, studentId, status }) {
      if (user.role !== "TEACHER")
        throw new AppError(
          403,
          "FORBIDDEN",
          "Hanya guru yang dapat mengubah status kehadiran.",
        );
      const session = await repository.findSessionForReader(sessionId, user);
      if (!session)
        throw new AppError(404, "NOT_FOUND", "Sesi absensi tidak ditemukan.");
      const membership = await repository.findActiveMembership(
        session.classId,
        studentId,
      );
      if (!membership)
        throw new AppError(
          404,
          "NOT_FOUND",
          "Siswa bukan anggota kelas sesi ini.",
        );
      const record = await repository.findAttendanceRecord(
        sessionId,
        studentId,
      );
      if (record)
        throw new AppError(
          409,
          "ATTENDANCE_ALREADY_SCANNED",
          "Siswa sudah melakukan scan; status tidak dapat diubah.",
        );
      const override = await repository.upsertStatusOverride({
        sessionId,
        studentId,
        status,
        createdById: user.id,
      });
      return {
        id: override.id,
        sessionId,
        studentId,
        status: override.status ?? status,
      };
    },
    async clearStatusOverride(user, sessionId, studentId) {
      if (user.role !== "TEACHER")
        throw new AppError(
          403,
          "FORBIDDEN",
          "Hanya guru yang dapat mengubah status kehadiran.",
        );
      const session = await repository.findSessionForReader(sessionId, user);
      if (!session)
        throw new AppError(404, "NOT_FOUND", "Sesi absensi tidak ditemukan.");
      await repository.deleteStatusOverride(sessionId, studentId);
      return { sessionId, studentId, cleared: true };
    },
    async sessionRoster(user, sessionId) {
      requireReader(user);
      const session = await repository.findSessionRoster(sessionId, user);
      if (!session)
        throw new AppError(404, "NOT_FOUND", "Sesi absensi tidak ditemukan.");
      return rosterPayload(session, now());
    },
    async dailyRecap(user, query) {
      if (user.role !== "TEACHER")
        throw new AppError(
          403,
          "FORBIDDEN",
          "Hanya guru yang dapat melihat rekap harian.",
        );
      const start = new Date(`${query.date}T00:00:00.000Z`);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
      const sessions = await repository.listSessionsForRecap({
        user,
        from: start,
        to: end,
        classId: query.classId,
      });
      const nowValue = now();
      const absent = [];
      const summary = emptySummary();
      sessions.forEach((session) => {
        session.class.memberships.forEach(({ student }) => {
          const { record, override, status } = resolveMemberStatus(
            session,
            student,
            nowValue,
          );
          if (!status) return;
          addToSummary(summary, status);
          if (!isPresentStatus(status))
            absent.push(
              reportMetadata({ session, student, record, status, override }),
            );
        });
      });
      return { date: query.date, absent, summary };
    },
    async recapSummary(user, query = {}) {
      if (user.role !== "TEACHER")
        throw new AppError(
          403,
          "FORBIDDEN",
          "Hanya guru yang dapat melihat rekap keseluruhan.",
        );
      const sessions = await repository.listSessionsForRecap({
        user,
        classId: query.classId,
      });
      const nowValue = now();
      const perStudent = new Map();
      const summary = emptySummary();
      sessions.forEach((session) => {
        session.class.memberships.forEach(({ student }) => {
          const { status } = resolveMemberStatus(session, student, nowValue);
          let entry = perStudent.get(student.id);
          if (!entry) {
            entry = {
              studentId: student.id,
              studentName: student.name,
              studentNumber: student.studentProfile?.studentNumber ?? null,
              classId: session.classId,
              className: session.class?.name,
              totalMeetings: 0,
              hadir: 0,
              terlambat: 0,
              izin: 0,
              sakit: 0,
              alfa: 0,
              dispen: 0,
              tidakHadir: 0,
              h: 0,
            };
            perStudent.set(student.id, entry);
          }
          entry.totalMeetings += 1;
          if (!status) return;
          addToSummary(entry, status);
          addToSummary(summary, status);
        });
      });
      const items = [...perStudent.values()];
      items.forEach((entry) => {
        entry.h = entry.hadir + entry.terlambat;
      });
      summary.h = summary.hadir + summary.terlambat;
      return {
        items,
        summary,
        meta: { totalStudents: items.length, totalSessions: sessions.length },
      };
    },
  };
}
