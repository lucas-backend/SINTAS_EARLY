import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { formatSchoolDate } from '../../lib/dateTime'

function BannerPeriod({ banner }) {
  const start = banner.displayStartAt
  const end = banner.displayEndAt
  if (!start && !end) return null
  return (
    <p className="mt-1 text-caption text-ink-500">
      {start ? formatSchoolDate(start) : null}
      {start && end ? ' – ' : null}
      {end ? formatSchoolDate(end) : null}
    </p>
  )
}

export function ActiveBanner({ banner }) {
  const [broken, setBroken] = useState(false)
  const showImage =
    banner.imageUrl && !broken

  return (
    <article
      role="group"
      aria-label={banner.title}
      className="overflow-hidden rounded-radius-md border border-line-200 bg-surface-0 shadow-1"
    >
      {showImage ? (
        <img
          src={banner.imageUrl}
          alt={banner.title}
          onError={() => setBroken(true)}
          className="aspect-[16/7] w-full object-cover md:aspect-[3/1]"
        />
      ) : (
        <div className="flex aspect-[16/7] w-full flex-col justify-center bg-school-blue-050 px-5 py-4 md:aspect-[3/1]">
          <p className="text-heading-sm font-bold text-school-blue-900">
            {banner.title}
          </p>
          {banner.content ? (
            <p className="mt-1 text-body-md text-ink-700">{banner.content}</p>
          ) : (
            <p className="mt-1 flex items-center gap-1 text-caption text-ink-500">
              <ImageOff className="h-4 w-4" aria-hidden="true" />
              Gambar banner tidak tersedia.
            </p>
          )}
        </div>
      )}
      <BannerPeriod banner={banner} />
    </article>
  )
}