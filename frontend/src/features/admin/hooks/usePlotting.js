import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  academicKeys,
  createMembership,
  deleteMembership,
  getMemberships,
  updateMembership,
} from '../../../services/academicService'

export function useMemberships(filters = {}) {
  return useQuery({
    queryKey: academicKeys.memberships(filters),
    queryFn: () => getMemberships(filters),
    placeholderData: (previous) => previous,
  })
}

function useMembershipMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: academicKeys.memberships() })
      queryClient.invalidateQueries({ queryKey: ['academic'] })
    },
  })
}

export function useCreateMembership() {
  return useMembershipMutation(createMembership)
}

export function useUpdateMembership() {
  return useMembershipMutation(({ id, data }) => updateMembership(id, data))
}

export function useDeleteMembership() {
  return useMembershipMutation(deleteMembership)
}
