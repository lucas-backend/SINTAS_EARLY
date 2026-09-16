import { Router } from 'express'
import { createAttendanceController } from '../controllers/attendance.controller.js'
import { createAttendanceRepository } from '../repositories/attendance.repository.js'
import { createAttendanceService } from '../services/attendance.service.js'
import { createAuthenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { idParamSchema } from '../schemas/common.schemas.js'
import { attendanceSessionSchema } from '../schemas/attendance.schemas.js'

export function createAttendanceRouter({ prisma, env }) {
  const router = Router()
  const authenticate = createAuthenticate({ env })
  const service = createAttendanceService({ repository: createAttendanceRepository(prisma), env })
  const controller = createAttendanceController({ service })
  router.post('/', authenticate, authorize('TEACHER'), validate(attendanceSessionSchema), controller.createSession)
  router.get('/', authenticate, authorize('ADMIN', 'TEACHER'), controller.listSessions)
  router.get('/:id/qr', authenticate, authorize('ADMIN', 'TEACHER'), validate(idParamSchema, 'params'), controller.getQr)
  return router
}