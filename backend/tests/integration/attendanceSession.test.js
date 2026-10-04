import argon2 from 'argon2'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../../src/app.js'
import { isOpaqueQrPayload } from '../../src/domain/attendanceQr.js'

const env = {
  NODE_ENV: 'test', CORS_ORIGIN: 'http://localhost:5173', JWT_SECRET: 'test-secret-that-is-long-enough-for-jwt', JWT_ISSUER: 'sintas-test', ACCESS_TOKEN_TTL: '15m', AUTH_COOKIE_NAME: 'auth_token', SCHOOL_TIMEZONE: 'Asia/Jakarta',
}
const passwordHash = await argon2.hash('password-123', { type: argon2.argon2id })
const users = [
  { id: 1, username: 'admin', passwordHash, role: 'ADMIN', name: 'Admin', email: 'admin@test.local', studentProfile: null },
  { id: 2, username: 'teacher', passwordHash, role: 'TEACHER', name: 'Teacher', email: 'teacher@test.local', studentProfile: null },
  { id: 3, username: 'student', passwordHash, role: 'STUDENT', name: 'Student', email: 'student@test.local', studentProfile: { studentNumber: 'S-1' } },
  { id: 4, username: 'other-teacher', passwordHash, role: 'TEACHER', name: 'Other Teacher', email: 'other@test.local', studentProfile: null },
]

function createPrisma() {
  const sessions = []
  const assignments = []
  const baseAssignment = {
    id: 60, teacherId: 2, classId: 30, subjectId: 40, isActive: true,
    class: { id: 30, name: 'X IPA 1' },
    subject: { id: 40, name: 'Math' },
    teacher: { id: 2, name: 'Teacher' },
  }
  assignments.push(baseAssignment)
  const teacherAssignment = {
    findFirst: vi.fn(({ where }) => {
      if (where.id !== undefined) {
        const match = assignments.find((value) => value.id === where.id && (where.isActive === undefined || value.isActive === where.isActive))
        return Promise.resolve(match ?? null)
      }
      const match = assignments.find((value) =>
        value.teacherId === where.teacherId &&
        value.classId === where.classId &&
        value.subjectId === where.subjectId &&
        (where.isActive === undefined || value.isActive === where.isActive),
      )
      return Promise.resolve(match ?? null)
    }),
    create: vi.fn(({ data }) => {
      const created = { ...data, id: assignments.length + 1, class: baseAssignment.class, subject: baseAssignment.subject, teacher: baseAssignment.teacher }
      assignments.push(created)
      return Promise.resolve(created)
    }),
    update: vi.fn(({ where, data }) => {
      const match = assignments.find((value) => value.id === where.id)
      Object.assign(match, data)
      return Promise.resolve(match)
    }),
  }
  const prisma = {
    user: {
      findUnique: vi.fn(({ where }) => Promise.resolve(users.find((value) => value.id === where.id || value.username === where.username) ?? null)),
      findFirst: vi.fn(({ where }) => Promise.resolve(users.find((value) => value.id === where.id && (where.role === undefined || value.role === where.role)) ?? null)),
    },
    teacherAssignment,
    class: { findUnique: vi.fn(({ where }) => Promise.resolve(where.id === 30 ? { id: 30, name: 'X IPA 1' } : null)) },
    subject: { findUnique: vi.fn(({ where }) => Promise.resolve(where.id === 40 ? { id: 40, name: 'Math' } : null)) },
    attendanceSession: {
      create: vi.fn(({ data }) => {
        if (sessions.some((value) => value.assignmentId === data.assignmentId && value.sessionDate.valueOf() === data.sessionDate.valueOf() && value.startAt.valueOf() === data.startAt.valueOf() && value.endAt.valueOf() === data.endAt.valueOf())) {
          return Promise.reject({ code: 'P2002' })
        }
        const resolved = assignments.find((value) => value.id === data.assignmentId) ?? baseAssignment
        const session = { ...data, id: sessions.length + 1, createdAt: new Date(), assignment: resolved, class: resolved.class }
        sessions.push(session)
        return Promise.resolve(session)
      }),
      findMany: vi.fn(({ where }) => Promise.resolve(sessions.filter((value) => !where?.assignment || (where.assignment.teacherId === value.assignment.teacherId && value.assignment.isActive)))),
      findFirst: vi.fn(({ where }) => Promise.resolve(sessions.find((value) => value.id === where.id && (!where.assignment || (where.assignment.teacherId === value.assignment.teacherId && value.assignment.isActive))) ?? null)),
      update: vi.fn(({ where, data }) => {
        const session = sessions.find((value) => value.id === where.id)
        Object.assign(session, data)
        const resolved = assignments.find((value) => value.id === session.assignmentId) ?? baseAssignment
        return Promise.resolve({ ...session, assignment: resolved, class: resolved.class })
      }),
    },
    attendanceRecord: {
      count: vi.fn().mockResolvedValue(0),
    },
    $transaction: vi.fn((callback) => callback({ teacherAssignment })),
  }
  return { prisma, sessions }
}

async function login(app, username) {
  const response = await request(app).post('/api/v1/auth/login').send({ username, password: 'password-123' })
  return response.headers['set-cookie']
}

const sessionBody = {
  classId: 30,
  subjectId: 40,
  teacherId: 2,
  sessionDate: '2026-09-17',
  startAt: '2026-09-17T08:00:00+07:00',
  endAt: '2026-09-17T09:00:00+07:00',
  timezone: 'Asia/Jakarta',
}

describe('attendance session scope', () => {
  it('rejects a teacher from creating a session', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const cookie = await login(app, 'teacher')
    const response = await request(app).post('/api/v1/attendance-sessions').set('Cookie', cookie).send(sessionBody)
    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(prisma.attendanceSession.create).not.toHaveBeenCalled()
  })

  it('rejects invalid time ranges before creating a session', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const cookie = await login(app, 'admin')
    const response = await request(app).post('/api/v1/attendance-sessions').set('Cookie', cookie).send({ ...sessionBody, endAt: sessionBody.startAt })
    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('INVALID_TIME_RANGE')
    expect(prisma.attendanceSession.create).not.toHaveBeenCalled()
  })

  it('rejects duplicate sessions and keeps QR payload opaque', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const cookie = await login(app, 'admin')
    const created = await request(app).post('/api/v1/attendance-sessions').set('Cookie', cookie).send(sessionBody)
    expect(created.status).toBe(200)
    expect(created.body.data.qrPayload).toBeUndefined()
    const duplicate = await request(app).post('/api/v1/attendance-sessions').set('Cookie', cookie).send(sessionBody)
    expect(duplicate.status).toBe(409)
    expect(duplicate.body.error.code).toBe('DUPLICATE_ATTENDANCE_SESSION')

    const list = await request(app).get('/api/v1/attendance-sessions').set('Cookie', cookie)
    expect(list.status).toBe(200)
    expect(list.body.data[0].qrPayload).toBeUndefined()
    const qr = await request(app).get('/api/v1/attendance-sessions/1/qr').set('Cookie', cookie)
    expect(qr.status).toBe(200)
    expect(isOpaqueQrPayload(qr.body.data.qrPayload)).toBe(true)
    expect(qr.body.data.qrPayload).not.toContain('Teacher')
    expect(qr.body.data.qrPayload).not.toContain('Math')
  })

  it('enforces role and teacher ownership on reads', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const adminCookie = await login(app, 'admin')
    await request(app).post('/api/v1/attendance-sessions').set('Cookie', adminCookie).send(sessionBody)
    const teacherCookie = await login(app, 'teacher')
    expect((await request(app).get('/api/v1/attendance-sessions').set('Cookie', teacherCookie)).body.data).toHaveLength(1)
    const otherCookie = await login(app, 'other-teacher')
    expect((await request(app).get('/api/v1/attendance-sessions').set('Cookie', otherCookie)).body.data).toEqual([])
    expect((await request(app).get('/api/v1/attendance-sessions/1/qr').set('Cookie', otherCookie)).status).toBe(404)
    expect((await request(app).get('/api/v1/attendance-sessions').set('Cookie', await login(app, 'student'))).status).toBe(403)
    expect(prisma.attendanceSession.findMany).toHaveBeenCalled()
  })

  it('lets an admin create, update, and delete a session without records', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const adminCookie = await login(app, 'admin')

    const created = await request(app).post('/api/v1/attendance-sessions').set('Cookie', adminCookie).send(sessionBody)
    expect(created.status).toBe(200)
    expect(created.body.data.id).toBe(1)

    const patched = await request(app).patch('/api/v1/attendance-sessions/1').set('Cookie', adminCookie).send({ ...sessionBody, startAt: '2026-09-17T08:30:00+07:00', endAt: '2026-09-17T09:30:00+07:00' })
    expect(patched.status).toBe(200)
    expect(patched.body.data.startAt).toBe('2026-09-17T01:30:00.000Z')

    const deleted = await request(app).delete('/api/v1/attendance-sessions/1').set('Cookie', adminCookie)
    expect(deleted.status).toBe(200)
    expect(prisma.attendanceSession.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }))
  })

  it('blocks admin update and delete when the session already has records', async () => {
    const { prisma } = createPrisma()
    prisma.attendanceRecord.count.mockResolvedValue(2)
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const adminCookie = await login(app, 'admin')
    await request(app).post('/api/v1/attendance-sessions').set('Cookie', adminCookie).send(sessionBody)

    const patched = await request(app).patch('/api/v1/attendance-sessions/1').set('Cookie', adminCookie).send({ ...sessionBody, startAt: '2026-09-17T08:30:00+07:00', endAt: '2026-09-17T09:30:00+07:00' })
    expect(patched.status).toBe(409)
    expect(patched.body.error.code).toBe('SESSION_HAS_RECORDS')

    const deleted = await request(app).delete('/api/v1/attendance-sessions/1').set('Cookie', adminCookie)
    expect(deleted.status).toBe(409)
    expect(deleted.body.error.code).toBe('SESSION_HAS_RECORDS')
  })

  it('rejects a teacher from updating or deleting sessions', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const adminCookie = await login(app, 'admin')
    await request(app).post('/api/v1/attendance-sessions').set('Cookie', adminCookie).send(sessionBody)
    const teacherCookie = await login(app, 'teacher')

    expect((await request(app).patch('/api/v1/attendance-sessions/1').set('Cookie', teacherCookie).send(sessionBody)).status).toBe(403)
    expect((await request(app).delete('/api/v1/attendance-sessions/1').set('Cookie', teacherCookie)).status).toBe(403)
  })

  it('reactivates an archived assignment instead of creating a new one', async () => {
    const { prisma } = createPrisma()
    const archived = { id: 99, teacherId: 2, classId: 30, subjectId: 40, isActive: false, class: { id: 30, name: 'X IPA 1' }, subject: { id: 40, name: 'Math' }, teacher: { id: 2, name: 'Teacher' } }
    prisma.teacherAssignment.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(archived)
    prisma.teacherAssignment.update.mockResolvedValueOnce({ ...archived, isActive: true })
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const adminCookie = await login(app, 'admin')

    const response = await request(app).post('/api/v1/attendance-sessions').set('Cookie', adminCookie).send(sessionBody)
    expect(response.status).toBe(200)
    expect(prisma.teacherAssignment.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 99 }, data: { isActive: true } }),
    )
    expect(prisma.teacherAssignment.create).not.toHaveBeenCalled()
  })
})
