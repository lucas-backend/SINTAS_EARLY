import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthForgotPassword } from '../../hooks/useAuth'
import { getErrorMessage, getFieldErrors } from '../../lib/errorMapping'
import { roleHome } from '../../lib/permissions'
import { forgotPasswordSchema } from '../../schemas/auth'
import { useSessionStore } from '../../stores/sessionStore'

export default function ForgotPasswordPage() {
  const user = useSessionStore((state) => state.user)
  const forgotPassword = useAuthForgotPassword()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
      birthDate: '',
      password: '',
      passwordConfirmation: '',
    },
  })

  if (user) return <Navigate to={roleHome(user.role)} replace />

  const onSubmit = (values) => {
    forgotPassword.mutateAsync(values).catch((error) => {
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
        <h1 className="text-heading-lg font-bold text-ink-900">Pulihkan password</h1>
        <p className="mt-2 text-body-md text-ink-700">
          Masukkan email dan tanggal lahir yang terdaftar, lalu tetapkan password baru.
        </p>
        {errors.root?.server ? (
          <p role="alert" className="mt-3 rounded-radius-sm bg-danger-700 px-3 py-2 text-sm text-white">
            {errors.root.server.message}
          </p>
        ) : null}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-label-md text-ink-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-radius-sm border border-line-200 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email ? (
              <p id="email-error" className="mt-1 text-sm text-danger-700">
                {errors.email.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="birthDate" className="block text-label-md text-ink-700">
              Tanggal lahir
            </label>
            <input
              id="birthDate"
              type="date"
              autoComplete="bday"
              className="mt-1 w-full rounded-radius-sm border border-line-200 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
              aria-invalid={errors.birthDate ? true : undefined}
              aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
              {...register('birthDate')}
            />
            {errors.birthDate ? (
              <p id="birthDate-error" className="mt-1 text-sm text-danger-700">
                {errors.birthDate.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password" className="block text-label-md text-ink-700">
              Password baru
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
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
          <div>
            <label htmlFor="passwordConfirmation" className="block text-label-md text-ink-700">
              Konfirmasi password
            </label>
            <input
              id="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              className="mt-1 w-full rounded-radius-sm border border-line-200 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700"
              aria-invalid={errors.passwordConfirmation ? true : undefined}
              aria-describedby={
                errors.passwordConfirmation ? 'passwordConfirmation-error' : undefined
              }
              {...register('passwordConfirmation')}
            />
            {errors.passwordConfirmation ? (
              <p id="passwordConfirmation-error" className="mt-1 text-sm text-danger-700">
                {errors.passwordConfirmation.message}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || forgotPassword.isPending}
            className="w-full rounded-radius-md bg-school-blue-700 px-4 py-2.5 text-label-md text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Mengirim…' : 'Kirim'}
          </button>
        </form>
        <p className="mt-4 text-sm text-ink-700">
          <Link to="/login" className="font-semibold text-school-blue-700">
            Kembali ke halaman masuk
          </Link>
        </p>
      </div>
    </main>
  )
}