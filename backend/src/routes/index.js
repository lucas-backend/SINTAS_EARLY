import { Router } from 'express'
import { createHealthRouter } from './health.routes.js'

export function createRoutes({ prisma }) {
  const router = Router()
  const health = createHealthRouter({ prisma })

  router.get('/health/live', health.live)
  router.get('/health/ready', health.ready)

  return router
}