import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUser, deleteUser, getUsers, resetUserPassword, updateUser, userKeys } from '../../../services/userService'

export function useAdminUsers(filters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => getUsers(filters),
    placeholderData: (previous) => previous,
  })
}

function useUserMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: userKeys.list() })
      queryClient.invalidateQueries({ queryKey: ['academic'] })
    },
  })
}

export function useCreateUser() {
  return useUserMutation(createUser)
}

export function useUpdateUser() {
  return useUserMutation(({ id, data }) => updateUser(id, data))
}

export function useDeleteUser() {
  return useUserMutation(deleteUser)
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, data }) => resetUserPassword(id, data),
  })
}
