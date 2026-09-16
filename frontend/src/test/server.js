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
  http.get(`${API_BASE_URL}/attendance/today`, () =>
    HttpResponse.json({ data: [] }),
  ),
  http.get(`${API_BASE_URL}/banners`, () => HttpResponse.json({ data: [] })),
  http.get(`${API_BASE_URL}/attendance/history`, () =>
    HttpResponse.json({
      data: {
        items: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
    }),
  ),
  http.get(`${API_BASE_URL}/academic/assignments`, () =>
    HttpResponse.json({ data: [] }),
  ),
  http.get(`${API_BASE_URL}/attendance-sessions`, () =>
    HttpResponse.json({ data: [] }),
  ),
]

export const server = setupServer(...handlers)