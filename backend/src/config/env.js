import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  SCHOOL_TIMEZONE: z.string().min(1).default('Asia/Jakarta'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
})

export function parseEnv(values = process.env) {
  return envSchema.parse(values)
}

export function getEnv(values = process.env) {
  return parseEnv(values)
}