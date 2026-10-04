import argon2 from "argon2";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app.js";

const env = {
  NODE_ENV: "test",
  CORS_ORIGIN: "http://localhost:5173",
  JWT_SECRET: "test-secret-that-is-long-enough-for-jwt",
  JWT_ISSUER: "sintas-test",
  ACCESS_TOKEN_TTL: "15m",
  AUTH_COOKIE_NAME: "auth_token",
  SCHOOL_TIMEZONE: "Asia/Jakarta",
};
const passwordHash = await argon2.hash("password-123", {
  type: argon2.argon2id,
});
const users = [
  { id: 1, username: "admin", passwordHash, role: "ADMIN", name: "Admin", email: "admin@test.local", studentProfile: null },
  { id: 2, username: "teacher", passwordHash, role: "TEACHER", name: "Teacher", email: "teacher@test.local", studentProfile: null },
  { id: 3, username: "student", passwordHash, role: "STUDENT", name: "Student", email: "student@test.local", studentProfile: { studentNumber: "S-1" } },
  { id: 4, username: "other-student", passwordHash, role: "STUDENT", name: "Other Student", email: "other-student@test.local", studentProfile: { studentNumber: "S-2" } },
  { id: 5, username: "other-teacher", passwordHash, role: "TEACHER", name: "Other Teacher", email: "other-teacher@test.local", studentProfile: null },
];

const students = [
  { id: 3, name: "Student", studentProfile: { studentNumber: "S-1" } },
  { id: 4, name: "Other Student", studentProfile: { studentNumber: "S-2" } },
];

function buildSessions() {
  return [
    {
      id: 10,
      assignmentId: 60,
      classId: 30,
      sessionDate: new Date("2026-09-16T00:00:00.000Z"),
      startAt: new Date("2026-09-16T01:00:00.000Z"),
      endAt: new Date("2026-09-16T02:00:00.000Z"),
      assignment: {
        subjectId: 40,
        subject: { id: 40, name: "Math" },
        teacherId: 2,
        isActive: true,
        teacher: { name: "Teacher" },
      },
      class: {
        id: 30,
        name: "X IPA 1",
        memberships: students.map((student) => ({
          studentId: student.id,
          isActive: true,
          student,
        })),
      },
      records: [
        {
          id: 100,
          sessionId: 10,
          studentId: 3,
          scannedAt: new Date("2026-09-16T01:05:00.000Z"),
          status: "HADIR",
          lateMinutes: 0,
        },
      ],
      statusOverrides: [
        { id: 200, sessionId: 10, studentId: 4, status: "IZIN" },
      ],
    },
    {
      id: 11,
      assignmentId: 60,
      classId: 30,
      sessionDate: new Date("2026-09-16T00:00:00.000Z"),
      startAt: new Date("2026-09-16T03:00:00.000Z"),
      endAt: new Date("2026-09-16T04:00:00.000Z"),
      assignment: {
        subjectId: 40,
        subject: { id: 40, name: "Math" },
        teacherId: 2,
        isActive: true,
        teacher: { name: "Teacher" },
      },
      class: {
        id: 30,
        name: "X IPA 1",
        memberships: students.map((student) => ({
          studentId: student.id,
          isActive: true,
          student,
        })),
      },
      records: [],
      statusOverrides: [],
    },
  ];
}

function createPrisma() {
  const sessions = buildSessions();
  return {
    sessions,
    user: {
      findUnique: vi.fn(({ where }) =>
        Promise.resolve(
          users.find(
            (value) =>
              value.id === where.id || value.username === where.username,
          ) ?? null,
        ),
      ),
    },
    attendanceSession: {
      findMany: vi.fn(({ where }) =>
        Promise.resolve(
          sessions.filter((session) => {
            if (where.assignment?.teacherId && session.assignment.teacherId !== where.assignment.teacherId) return false;
            if (where.sessionDate?.gte && session.sessionDate < where.sessionDate.gte) return false;
            if (where.sessionDate?.lte && session.sessionDate > where.sessionDate.lte) return false;
            if (where.classId && session.classId !== where.classId) return false;
            return true;
          }),
        ),
      ),
      findFirst: vi.fn(({ where }) =>
        Promise.resolve(
          sessions.find((session) => {
            if (where.id && session.id !== where.id) return false;
            if (where.assignment?.teacherId && session.assignment.teacherId !== where.assignment.teacherId) return false;
            return true;
          }) ?? null,
        ),
      ),
    },
    classStudent: {
      findFirst: vi.fn(({ where }) =>
        Promise.resolve(
          where.classId === 30 && [3, 4].includes(where.studentId)
            ? { id: 1, classId: 30, studentId: where.studentId, isActive: true }
            : null,
        ),
      ),
    },
    attendanceStatusOverride: {
      upsert: vi.fn(({ where, create }) =>
        Promise.resolve({
          id: 300,
          sessionId: where.sessionId_studentId.sessionId,
          studentId: where.sessionId_studentId.studentId,
          status: create.status,
          updatedAt: new Date("2026-09-16T05:00:00.000Z"),
        }),
      ),
    },
  };
}

function setServerTime(iso) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(iso));
}

afterEach(() => vi.useRealTimers());

async function login(app, username) {
  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({ username, password: "password-123" });
  return response.headers["set-cookie"];
}

describe("teacher attendance recap", () => {
  it("lets a teacher set a manual status and validates the target", async () => {
    setServerTime("2026-09-16T05:00:00.000Z");
    const prisma = createPrisma();
    const app = createApp({ prisma, env, logger: { error: vi.fn() } });
    const cookie = await login(app, "teacher");

    const ok = await request(app)
      .post("/api/v1/attendance-status-overrides")
      .set("Cookie", cookie)
      .send({ sessionId: 10, studentId: 4, status: "SAKIT" });
    expect(ok.status).toBe(200);
    expect(ok.body.data).toMatchObject({
      sessionId: 10,
      studentId: 4,
      status: "SAKIT",
    });

    const invalid = await request(app)
      .post("/api/v1/attendance-status-overrides")
      .set("Cookie", cookie)
      .send({ sessionId: 10, studentId: 4, status: "HADIR" });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe("VALIDATION_ERROR");

    const unknownSession = await request(app)
      .post("/api/v1/attendance-status-overrides")
      .set("Cookie", cookie)
      .send({ sessionId: 999, studentId: 4, status: "IZIN" });
    expect(unknownSession.status).toBe(404);

    const notMember = await request(app)
      .post("/api/v1/attendance-status-overrides")
      .set("Cookie", cookie)
      .send({ sessionId: 10, studentId: 99, status: "IZIN" });
    expect(notMember.status).toBe(404);
  });

  it.each(["admin", "student"])(
    "rejects %s from setting manual status",
    async (username) => {
      const prisma = createPrisma();
      const app = createApp({ prisma, env, logger: { error: vi.fn() } });
      const cookie = await login(app, username);
      const response = await request(app)
        .post("/api/v1/attendance-status-overrides")
        .set("Cookie", cookie)
        .send({ sessionId: 10, studentId: 4, status: "IZIN" });
      expect(response.status).toBe(403);
      expect(prisma.attendanceStatusOverride.upsert).not.toHaveBeenCalled();
    },
  );

  it("returns the daily recap of students who did not attend", async () => {
    setServerTime("2026-09-16T05:00:00.000Z");
    const app = createApp({
      prisma: createPrisma(),
      env,
      logger: { error: vi.fn() },
    });
    const response = await request(app)
      .get("/api/v1/reports/attendance/daily?date=2026-09-16")
      .set("Cookie", await login(app, "teacher"));

    expect(response.status).toBe(200);
    expect(response.body.data.date).toBe("2026-09-16");
    expect(response.body.data.absent.map((row) => [row.studentId, row.status])).toEqual([
      [4, "IZIN"],
      [3, "TIDAK_HADIR"],
      [4, "TIDAK_HADIR"],
    ]);
  });

  it("returns the overall per-student H.I.S.A.D summary", async () => {
    setServerTime("2026-09-16T05:00:00.000Z");
    const app = createApp({
      prisma: createPrisma(),
      env,
      logger: { error: vi.fn() },
    });
    const response = await request(app)
      .get("/api/v1/reports/attendance/summary")
      .set("Cookie", await login(app, "teacher"));

    expect(response.status).toBe(200);
    const byStudent = Object.fromEntries(
      response.body.data.items.map((item) => [item.studentId, item]),
    );
    expect(byStudent[3]).toMatchObject({
      totalMeetings: 2,
      hadir: 1,
      h: 1,
      tidakHadir: 1,
    });
    expect(byStudent[4]).toMatchObject({
      totalMeetings: 2,
      izin: 1,
      h: 0,
      tidakHadir: 1,
    });
    expect(response.body.data.summary).toMatchObject({ hadir: 1, izin: 1 });
  });

  it("scopes recap endpoints to teachers only", async () => {
    const prisma = createPrisma();
    const app = createApp({ prisma, env, logger: { error: vi.fn() } });
    const daily = await request(app)
      .get("/api/v1/reports/attendance/daily?date=2026-09-16")
      .set("Cookie", await login(app, "admin"));
    const summary = await request(app)
      .get("/api/v1/reports/attendance/summary")
      .set("Cookie", await login(app, "student"));
    expect(daily.status).toBe(403);
    expect(summary.status).toBe(403);
  });
});
