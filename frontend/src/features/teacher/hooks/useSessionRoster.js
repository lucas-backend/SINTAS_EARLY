import { useQuery } from '@tanstack/react-query'
import {
  attendanceKeys,
  getSessionRoster,
} from '../../../services/attendanceService'

export function useSessionRoster(sessionId) {
  return useQuery({
    queryKey: attendanceKeys.sessionRoster(sessionId),
    queryFn: () => getSessionRoster(sessionId),
    enabled: Number.isInteger(sessionId) && sessionId > 0,
    placeholderData: (previous) => previous,
  })
}
