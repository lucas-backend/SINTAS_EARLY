import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  academicKeys,
  createAssignment,
  createMembership,
  deleteAssignment,
  deleteMembership,
  getAssignmentsManage,
  getMemberships,
  updateAssignment,
  updateMembership,
} from '../../../services/academicService'

export function useMemberships(filters = {}) {
  return useQuery({
    queryKey: academicKeys.memberships(filters),
    queryFn: () => getMemberships(filters),
    placeholderData: (previous) => previous,
  })
}

export function useAssignmentsManage(filters = {}) {
  return useQuery({
    queryKey: academicKeys.assignmentsManage(filters),
    queryFn: () => getAssignmentsManage(filters),
    placeholderData: (previous) => previous,
  })
}

function usePlottingMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: academicKeys.memberships() })
      queryClient.invalidateQueries({ queryKey: academicKeys.assignmentsManage() })
      queryClient.invalidateQueries({ queryKey: ['academic'] })
    },
  })
}

export function useCreateMembership() {
  return usePlottingMutation(createMembership)
}

export function useUpdateMembership() {
  return usePlottingMutation(({ id, data }) => updateMembership(id, data))
}

export function useDeleteMembership() {
  return usePlottingMutation(deleteMembership)
}

export function useCreateAssignment() {
  return usePlottingMutation(createAssignment)
}

export function useUpdateAssignment() {
  return usePlottingMutation(({ id, data }) => updateAssignment(id, data))
}

export function useDeleteAssignment() {
  return usePlottingMutation(deleteAssignment)
}
