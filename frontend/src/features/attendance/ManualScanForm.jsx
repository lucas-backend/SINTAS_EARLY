import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { manualScanSchema } from '../../schemas/scan'

const inputClass =
  'mt-1 w-full rounded-radius-sm border border-line-200 px-3 py-2 text-body-md text-ink-900 focus:outline-2 focus:outline-offset-2 focus:outline-school-blue-700'

// Manual fallback bila kamera tidak tersedia/ditolak (docs/PROMPT_GUIDE.md F3).
// Payload dikirim sama persis ke POST /attendance-scans; status ditentukan
// server, bukan validasi client.
export function ManualScanForm({ initialPayload = '', isPending, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(manualScanSchema),
    defaultValues: { qrPayload: initialPayload },
  })

  return (
    <form
      onSubmit={handleSubmit(
        ({ qrPayload }) => onSubmit(qrPayload),
        () => {},
      )}
      className="space-y-4"
      noValidate
    >
      <div>
        <label htmlFor="manual-qr-payload" className="block text-label-md text-ink-700">
          Kode QR
        </label>
        <input
          id="manual-qr-payload"
          type="text"
          autoComplete="off"
          spellCheck="false"
          className={inputClass}
          aria-invalid={errors.qrPayload ? true : undefined}
          aria-describedby={
            errors.qrPayload ? 'manual-qr-payload-error' : undefined
          }
          placeholder="Salin kode dari guru, lalu tempel di sini"
          {...register('qrPayload')}
        />
        {errors.qrPayload ? (
          <p id="manual-qr-payload-error" className="mt-1 text-body-md text-danger-700">
            {errors.qrPayload.message}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-radius-md bg-school-blue-700 px-4 py-2.5 text-label-md text-white hover:bg-school-blue-900 disabled:opacity-60 sm:w-auto"
      >
        {isPending ? 'Memproses…' : 'Kirim absensi'}
      </button>
    </form>
  )
}