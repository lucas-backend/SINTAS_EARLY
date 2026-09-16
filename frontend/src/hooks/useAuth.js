import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { roleHome } from '../lib/permissions'
import { authKeys, forgotPassword, login, logout } from '../services/authService'
import { useSessionStore } from '../stores/sessionStore'

export function useAuthLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess(user) {
      useSessionStore.getState().setUser(user)
      queryClient.setQueryData(authKeys.session, user)
      navigate(roleHome(user.role), { replace: true })
    },
  })
}

export function useAuthLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess() {
      queryClient.removeQueries({ queryKey: authKeys.session })
      useSessionStore.getState().clearSession()
      navigate('/login', { replace: true })
    },
  })
}

export function useAuthForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  })
}