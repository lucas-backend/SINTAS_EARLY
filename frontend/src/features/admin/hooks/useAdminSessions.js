import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  attendanceKeys,
  createAttendanceSession,
  deleteAttendanceSession,
  getAdminSessions,
  updateAttendanceSession,
} from '../../../services/attendanceService'

export function useAdminSessions() {
  return useQuery({
    queryKey: attendanceKeys.adminSessions,
    queryFn: getAdminSessions,
  })
}

function useSessionMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.adminSessions })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.teacherSessions })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}

export function useCreateAdminSession() {
  return useSessionMutation(createAttendanceSession)
}

export function useUpdateAdminSession() {
  return useSessionMutation(({ id, data }) => updateAttendanceSession(id, data))
}

export function useDeleteAdminSession() {
  return useSessionMutation(deleteAttendanceSession)
}
