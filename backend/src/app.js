import express from 'express'
import { prisma as defaultPrisma } from './config/database.js'
import { AppError, errorHandler } from './middleware/errorHandler.js'
import { requestId } from './middleware/requestId.js'
import { createRoutes } from './routes/index.js'

export function createApp({ prisma = defaultPrisma, logger } = {}) {
  const app = express()

  app.disable('x-powered-by')
  app.use(requestId)
  app.use(express.json({ limit: '100kb' }))
  app.use(createRoutes({ prisma }))
  app.use((_req, _res, next) => next(new AppError(404, 'NOT_FOUND', 'Endpoint tidak ditemukan.')))
  app.use((error, req, res, next) => errorHandler(error, req, res, next, logger))

  return app
}