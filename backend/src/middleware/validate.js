import { AppError } from './errorHandler.js'

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      const fieldErrors = Object.fromEntries(result.error.issues.map((issue) => [issue.path.join('.') || '_form', issue.message]))
      next(new AppError(400, 'VALIDATION_ERROR', 'Data yang dikirim tidak valid.', fieldErrors))
      return
    }
    req[source] = result.data
    next()
  }
}
