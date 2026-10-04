import { useQuery } from '@tanstack/react-query'
import {
  attendanceKeys,
  getDailyRecap,
} from '../../../services/attendanceService'

export function useDailyRecap({ date, classId } = {}) {
  return useQuery({
    queryKey: attendanceKeys.dailyRecap({ date, classId }),
    queryFn: () => getDailyRecap({ date, classId }),
    enabled: Boolean(date),
  })
}
