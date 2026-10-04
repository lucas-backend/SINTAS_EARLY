import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  attendanceKeys,
  setManualAttendanceStatus,
} from '../../../services/attendanceService'

// Input status manual guru (D24/R3). Setelah sukses, rekap harian & keseluruhan
// disegarkan — tidak ada perhitungan status di client.
export function useSetManualAttendanceStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: attendanceKeys.manualOverride,
    mutationFn: (data) => setManualAttendanceStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.dailyRecapBase })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.recapSummaryBase })
    },
  })
}
