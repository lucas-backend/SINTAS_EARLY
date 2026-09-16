import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthLogin } from '../../hooks/useAuth'
import { getErrorMessage, getFieldErrors } from '../../lib/errorMapping'
import { roleHome } from '../../lib/permissions'
import { loginSchema } from '../../schemas/auth'
import { useSessionStore } from '../../stores/sessionStore'

export default function LoginPage() {
  const location = useLocation()
  const [passwordReset] = useState(() => Boolean(location.state?.passwordReset))
  const user = useSessionStore((state) => state.user)
  const sessionExpired = useSessionStore((state) => state.sessionExpired)
  const login = useAuthLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  if (user) return <Navigate to={roleHome(user.role)} replace />

  const onSubmit = (values) => {
    login.mutateAsync(values).catch((error) => {
      const entries = Object.entries(getFieldErrors(error))
      if (entries.length > 0) {
        entries.forEach(([name, messages]) =>
          setError(name, { type: 'server', message: messages[0] }),
        )
      } else {
        setError('root.server', {
          type: 'server',
          message: getErrorMessage(error),
        })
      }
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-8">
      <div className="w-full max-w-md rounded-radius-md border border-line-200 bg-surface-0 p-6 shadow-1">
        <h1 className="text-heading-lg font-bold text-ink-900">Masuk</h1>
        {sessionExpired ? (
          <p role="status" className="mt-3 rounded-radius-sm bg-school-blue-050 p-3 text-sm text-school-blue-900">
            Sesi Anda berakhir. Silakan masuk kembali.
          </p>
        ) : null}
        {passwordReset ? (
          <p role="status" className="mt-3 rounded-radius-sm bg-success-700 px-3 py-2 text-sm text-white">
            Password berhasil diubah. Silakan masuk kembali.
          </p>
        ) : null}
        {errors.root?.server ? (
          <p role="alert" className="mt-3 rounded-radius-sm bg-danger-700 px-3 py-2 text-sm text-white">
            {errors.root.server.message}
          </p>
        ) : null}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
          <div>
            <label htmlFor="username" className="block text-label-md text-ink-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="mt-1 w-full rounded-radius-sm border border-line-200 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
              aria-invalid={errors.username ? true : undefined}
              aria-describedby={errors.username ? 'username-error' : undefined}
              {...register('username')}
            />
            {errors.username ? (
              <p id="username-error" className="mt-1 text-sm text-danger-700">
                {errors.username.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password" className="block text-label-md text-ink-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-radius-sm border border-line-200 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
            {errors.password ? (
              <p id="password-error" className="mt-1 text-sm text-danger-700">
                {errors.password.message}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-radius-md bg-school-blue-700 px-4 py-2.5 text-label-md text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Masuk…' : 'Masuk'}
          </button>
        </form>
        <p className="mt-4 text-sm text-ink-700">
          <Link to="/forgot-password" className="font-semibold text-school-blue-700">
            Lupa password?
          </Link>
        </p>
      </div>
    </main>
  )
}