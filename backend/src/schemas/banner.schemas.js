import { z } from 'zod'

const date = z.coerce.date().nullable().optional()
const bannerFields = {
  title: z.string().trim().min(1).max(200),
  imageUrl: z.string().trim().url().max(500).nullable().optional(),
  content: z.string().trim().max(10000).nullable().optional(),
  isActive: z.boolean().default(false),
  displayStartAt: date,
  displayEndAt: date,
}

export const bannerSchema = z.object(bannerFields).strict().superRefine((value, context) => {
  if (value.displayStartAt && value.displayEndAt && value.displayEndAt <= value.displayStartAt) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['displayEndAt'], message: 'Waktu akhir harus setelah waktu mulai.' })
  }
  if (!value.imageUrl && !value.content) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['content'], message: 'Banner harus memiliki gambar atau konten.' })
  }
})

export const bannerPatchSchema = z.object(bannerFields).partial().strict().superRefine((value, context) => {
  if (value.displayStartAt && value.displayEndAt && value.displayEndAt <= value.displayStartAt) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['displayEndAt'], message: 'Waktu akhir harus setelah waktu mulai.' })
  }
})

export const activeBannerQuerySchema = z.object({ at: z.coerce.date().optional() }).strict()
