import { apiClient } from '../lib/apiClient'

export const attendanceKeys = {
  today: ['attendance', 'today'],
  historyBase: ['attendance', 'history'],
  history: (filters) => ['attendance', 'history', filters],
}

export async function getTodaySchedule() {
  const payload = await apiClient.get('/attendance/today')
  return payload.data
}

export async function getStudentHistory({
  from,
  to,
  status,
  page = 1,
  limit = 20,
}) {
  const payload = await apiClient.get('/attendance/history', {
    params: { from, to, status, page, limit },
  })
  return payload.data
}