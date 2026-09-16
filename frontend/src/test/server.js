import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

export const UNAUTHENTICATED = {
  error: {
    code: 'UNAUTHENTICATED',
    message: 'Sesi tidak valid atau sudah berakhir.',
  },
}

export const handlers = [
  http.get(`${API_BASE_URL}/me`, () =>
    HttpResponse.json(UNAUTHENTICATED, { status: 401 }),
  ),
]

export const server = setupServer(...handlers)