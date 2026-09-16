import axios from 'axios'
import { useSessionStore } from '../stores/sessionStore'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

const SAFE_METHODS = /^(GET|HEAD|OPTIONS)$/i

export class ApiError extends Error {
  constructor({ status, code, message, fieldErrors }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

export function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  if (!SAFE_METHODS.test(config.method ?? 'get')) {
    const token = readCookie('csrf_token')
    if (token) config.headers['x-csrf-token'] = token
  }
  return config
})

apiClient.interceptors.response.use(
  (response) =>
    response.config.responseType === 'blob' ? response : response.data,
  (error) => {
    const { response } = error
    if (!response) {
      return Promise.reject(
        new ApiError({
          status: 0,
          code: 'NETWORK_ERROR',
          message: 'Tidak dapat terhubung ke server. Periksa koneksi Anda.',
        }),
      )
    }
    const errorBody = response.data?.error
    const apiError = new ApiError({
      status: response.status,
      code: errorBody?.code ?? 'UNKNOWN_ERROR',
      message: errorBody?.message ?? 'Terjadi kesalahan.',
      fieldErrors: errorBody?.fieldErrors,
    })
    if (response.status === 401) useSessionStore.getState().handleUnauthorized()
    return Promise.reject(apiError)
  },
)