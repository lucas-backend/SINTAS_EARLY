import { useQuery } from '@tanstack/react-query'
import {
  attendanceKeys,
  getRecapSummary,
} from '../../../services/attendanceService'

export function useRecapSummary({ from, to, classId } = {}) {
  return useQuery({
    queryKey: attendanceKeys.recapSummary({ from, to, classId }),
    queryFn: () => getRecapSummary({ from, to, classId }),
  })
}
