import argon2 from 'argon2'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../../src/app.js'

const env = {
  NODE_ENV: 'test', CORS_ORIGIN: 'http://localhost:5173', JWT_SECRET: 'test-secret-that-is-long-enough-for-jwt', JWT_ISSUER: 'project-kak-lia-test', ACCESS_TOKEN_TTL: '15m', AUTH_COOKIE_NAME: 'auth_token',
}
const passwordHash = await argon2.hash('password-123', { type: argon2.argon2id })
const users = [
  { id: 1, username: 'admin', passwordHash, role: 'ADMIN', name: 'Admin', email: 'admin@test.local', studentProfile: null },
  { id: 2, username: 'teacher', passwordHash, role: 'TEACHER', name: 'Teacher', email: 'teacher@test.local', studentProfile: null },
  { id: 3, username: 'student', passwordHash, role: 'STUDENT', name: 'Student', email: 'student@test.local', studentProfile: { studentNumber: 'S-1' } },
]

function createPrisma() {
  let banner = { id: 10, title: 'Event', content: 'School event', isActive: true, displayStartAt: null, displayEndAt: null, createdById: 1 }
  const prisma = {
    user: {
      findUnique: vi.fn(({ where }) => Promise.resolve(users.find((value) => value.id === where.id || value.username === where.username) ?? null)),
      findFirst: vi.fn(({ where }) => Promise.resolve(users.find((value) => value.id === where.id && value.role === where.role) ?? null)),
      findMany: vi.fn(), count: vi.fn(), create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ ...users[0], ...data, id: 4 })), update: vi.fn(),
    },
    educationLevel: { findMany: vi.fn(), count: vi.fn(), create: vi.fn().mockResolvedValue({ id: 20, name: 'SMA' }), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    class: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn().mockResolvedValue({ id: 30, name: 'X IPA 1' }), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    subject: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn().mockResolvedValue({ id: 40, name: 'Math' }), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    classStudent: {
      findUnique: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([{ id: 50, isActive: true, class: { id: 30, name: 'X IPA 1' } }]), create: vi.fn(), update: vi.fn(),
    },
    teacherAssignment: {
      findUnique: vi.fn().mockResolvedValue(null), findMany: vi.fn(({ where }) => Promise.resolve([{ id: 60, teacherId: where.teacherId, classId: 30, subjectId: 40, isActive: true }])), create: vi.fn(), update: vi.fn(),
    },
    banner: {
      findMany: vi.fn().mockImplementation(({ where }) => Promise.resolve(where.isActive ? (banner.isActive ? [banner] : []) : [banner])),
      findUnique: vi.fn().mockImplementation(() => Promise.resolve(banner)),
      create: vi.fn(), update: vi.fn().mockImplementation((_args) => { banner = { ...banner, ..._args.data }; return Promise.resolve(banner) }), delete: vi.fn(),
    },
  }
  return { prisma, getBanner: () => banner }
}

async function login(app, username) {
  const response = await request(app).post('/api/v1/auth/login').send({ username, password: 'password-123' })
  return response.headers['set-cookie']
}

describe('academic, assignment, membership, and banner scope', () => {
  it('allows admin master management and rejects non-admin before querying mutation', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const adminCookie = await login(app, 'admin')
    const allowed = await request(app).post('/api/v1/academic/education-levels').set('Cookie', adminCookie).send({ name: 'SMA' })
    expect(allowed.status).toBe(200)
    expect(prisma.educationLevel.create).toHaveBeenCalledWith({ data: { name: 'SMA' } })

    const studentCookie = await login(app, 'student')
    const rejected = await request(app).post('/api/v1/academic/education-levels').set('Cookie', studentCookie).send({ name: 'SMK' })
    expect(rejected.status).toBe(403)
    expect(prisma.educationLevel.create).toHaveBeenCalledTimes(1)
  })

  it('queries teacher assignments using the authenticated teacher id', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const cookie = await login(app, 'teacher')
    const response = await request(app).get('/api/v1/academic/assignments').set('Cookie', cookie)
    expect(response.status).toBe(200)
    expect(prisma.teacherAssignment.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { teacherId: 2, isActive: true } }))
  })

  it('returns only active classes for the authenticated student', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const cookie = await login(app, 'student')
    const response = await request(app).get('/api/v1/academic/my-classes').set('Cookie', cookie)
    expect(response.status).toBe(200)
    expect(prisma.classStudent.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { studentId: 3, isActive: true } }))
  })

  it('shows active banners and hides them after an admin status change', async () => {
    const { prisma, getBanner } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const studentCookie = await login(app, 'student')
    const visible = await request(app).get('/api/v1/banners').set('Cookie', studentCookie)
    expect(visible.status).toBe(200)
    expect(visible.body.data).toHaveLength(1)
    const adminCookie = await login(app, 'admin')
    const hidden = await request(app).patch('/api/v1/banners/10').set('Cookie', adminCookie).send({ isActive: false })
    expect(hidden.status).toBe(200)
    expect(getBanner().isActive).toBe(false)
    expect((await request(app).get('/api/v1/banners').set('Cookie', studentCookie)).body.data).toHaveLength(0)
  })

  it('rejects pagination values outside the allowlist', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const cookie = await login(app, 'teacher')
    const response = await request(app).get('/api/v1/academic/classes?limit=101').set('Cookie', cookie)
    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(prisma.class.findMany).not.toHaveBeenCalled()
  })
})
