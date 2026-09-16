import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { queryClient } from '../lib/queryClient'
import { initialSessionState, useSessionStore } from '../stores/sessionStore'
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  queryClient.clear()
  useSessionStore.setState(initialSessionState)
})

afterAll(() => server.close())