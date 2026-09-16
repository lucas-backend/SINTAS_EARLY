import { apiClient } from '../lib/apiClient'

export const academicKeys = {
  assignments: ['academic', 'assignments'],
}

// Hanya mengembalikan assignment aktif milik guru yang login; scope ditentukan
// backend, bukan oleh parameter frontend (frontend/GUIDE.md section 5).
export async function getTeacherAssignments() {
  const payload = await apiClient.get('/academic/assignments')
  return payload.data
}
