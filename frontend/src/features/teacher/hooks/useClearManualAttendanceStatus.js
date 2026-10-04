import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  attendanceKeys,
  clearManualAttendanceStatus,
} from '../../../services/attendanceService'

// Menghapus override manual per (sesi, siswa); status kembali ke hasil
// scan/computed. Menyegarkan roster sesi + rekap.
export function useClearManualAttendanceStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: [...attendanceKeys.manualOverride, 'clear'],
    mutationFn: (data) => clearManualAttendanceStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.sessionRosterBase })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.dailyRecapBase })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.recapSummaryBase })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.classAttendanceBase })
    },
  })
}
