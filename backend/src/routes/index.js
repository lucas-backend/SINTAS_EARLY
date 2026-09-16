import { Router } from 'express'
import { createHealthRouter } from './health.routes.js'
import { createAuthRouter } from './auth.routes.js'

export function createRoutes({ prisma, env }) {
  const router = Router()
  const health = createHealthRouter({ prisma })
  const auth = createAuthRouter({ prisma, env })

  router.get('/health/live', health.live)
  router.get('/health/ready', health.ready)
  router.use('/api/v1/auth', auth)
  router.get('/api/v1/me', auth.me)
  router.patch('/api/v1/me', auth.updateMe)

  return router
}