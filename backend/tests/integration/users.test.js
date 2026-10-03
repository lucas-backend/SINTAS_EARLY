import argon2 from 'argon2'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../../src/app.js'

const env = {
  NODE_ENV: 'test', CORS_ORIGIN: 'http://localhost:5173', JWT_SECRET: 'test-secret-that-is-long-enough-for-jwt', JWT_ISSUER: 'sintas-test', ACCESS_TOKEN_TTL: '15m', AUTH_COOKIE_NAME: 'auth_token',
}
const passwordHash = await argon2.hash('password-123', { type: argon2.argon2id })

function createPrisma() {
  const users = [
    { id: 1, username: 'admin', passwordHash, role: 'ADMIN', name: 'Admin', email: 'admin@test.local', phone: null, birthDate: null, deletedAt: null, studentProfile: null, teacherProfile: null },
    { id: 2, username: 'teacher', passwordHash, role: 'TEACHER', name: 'Teacher', email: 'teacher@test.local', phone: null, birthDate: null, deletedAt: null, studentProfile: null, teacherProfile: {} },
    { id: 3, username: 'student', passwordHash, role: 'STUDENT', name: 'Student', email: 'student@test.local', phone: null, birthDate: null, deletedAt: null, studentProfile: { userId: 3, studentNumber: 'S-1', educationLevelId: 20 }, teacherProfile: null },
  ]
  const matches = (where = {}) => (user) => {
    if (where.deletedAt === null && user.deletedAt) return false
    if (where.role && user.role !== where.role) return false
    if (where.OR) return where.OR.some((clause) => (clause.username ? user.username.includes(clause.username.contains) : false) || (clause.name ? user.name.includes(clause.name.contains) : false))
    return true
  }
  const prisma = {
    user: {
      findUnique: vi.fn(({ where }) => {
        if (where.username !== undefined) return Promise.resolve(users.find((u) => u.username === where.username) ?? null)
        if (where.email !== undefined) return Promise.resolve(users.find((u) => u.email === where.email) ?? null)
        return Promise.resolve(users.find((u) => u.id === where.id) ?? null)
      }),
      findFirst: vi.fn(),
      findMany: vi.fn(({ where } = {}) => Promise.resolve(users.filter(matches(where)))),
      count: vi.fn(({ where } = {}) => Promise.resolve(users.filter(matches(where)).length)),
      create: vi.fn(),
      update: vi.fn(({ where, data }) => {
        const user = users.find((u) => u.id === where.id)
        const { studentProfile, ...rest } = data
        Object.assign(user, rest)
        if (studentProfile?.update) Object.assign(user.studentProfile, studentProfile.update)
        return Promise.resolve({ ...user })
      }),
    },
    studentProfile: {
      findUnique: vi.fn(({ where }) => Promise.resolve(users.find((u) => u.studentProfile?.studentNumber === where.studentNumber)?.studentProfile ?? null)),
    },
    educationLevel: {
      findUnique: vi.fn(({ where }) => Promise.resolve(where.id === 20 ? { id: 20, name: 'SMA' } : null)),
    },
  }
  return { prisma, users }
}

async function login(app, username) {
  const response = await request(app).post('/api/v1/auth/login').send({ username, password: 'password-123' })
  return response.headers['set-cookie']
}

describe('admin user management', () => {
  it('updates basic fields and student academic profile', async () => {
    const { prisma, users } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const cookie = await login(app, 'admin')
    const response = await request(app).patch('/api/v1/users/3').set('Cookie', cookie).send({ name: 'Student Baru', studentNumber: 'S-9', educationLevelId: 20 })
    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({ id: 3, name: 'Student Baru', studentNumber: 'S-9' })
    expect(users[2].studentProfile.studentNumber).toBe('S-9')
  })

  it('rejects academic fields for non-student accounts', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const cookie = await login(app, 'admin')
    const response = await request(app).patch('/api/v1/users/2').set('Cookie', cookie).send({ studentNumber: 'S-9' })
    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  it('rejects duplicate email before update', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const cookie = await login(app, 'admin')
    const response = await request(app).patch('/api/v1/users/3').set('Cookie', cookie).send({ email: 'teacher@test.local' })
    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('DUPLICATE_EMAIL')
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  it('hides admin targets and rejects non-admin editors', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const adminCookie = await login(app, 'admin')
    const notFound = await request(app).patch('/api/v1/users/1').set('Cookie', adminCookie).send({ name: 'X' })
    expect(notFound.status).toBe(404)

    const teacherCookie = await login(app, 'teacher')
    const rejected = await request(app).patch('/api/v1/users/3').set('Cookie', teacherCookie).send({ name: 'X' })
    expect(rejected.status).toBe(403)
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  it('soft deletes a user and blocks subsequent login', async () => {
    const { prisma, users } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const cookie = await login(app, 'admin')
    const response = await request(app).delete('/api/v1/users/3').set('Cookie', cookie)
    expect(response.status).toBe(200)
    expect(users[2].deletedAt).toBeInstanceOf(Date)
    const relogin = await request(app).post('/api/v1/auth/login').send({ username: 'student', password: 'password-123' })
    expect(relogin.status).toBe(401)
  })

  it('rejects deleting own account', async () => {
    const { prisma } = createPrisma()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const cookie = await login(app, 'admin')
    const response = await request(app).delete('/api/v1/users/1').set('Cookie', cookie)
    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('CANNOT_DELETE_SELF')
  })

  it('excludes soft-deleted users from the listing', async () => {
    const { prisma, users } = createPrisma()
    users[2].deletedAt = new Date()
    const app = createApp({ prisma, env, logger: { error: vi.fn() } })
    const cookie = await login(app, 'admin')
    const response = await request(app).get('/api/v1/users').set('Cookie', cookie)
    expect(response.status).toBe(200)
    expect(response.body.data.items.map((item) => item.id)).toEqual([1, 2])
  })
})
