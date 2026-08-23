import { z } from 'zod'

export const mealLogFormSchema = z
  .object({
    text: z.string().trim().max(500).optional(),
    // Use number (not coerce) so RHF zodResolver input/output types align under `tsc -b`.
    quantity: z.number().positive(),
    unit: z.enum(['g', 'ml', 'serving', 'piece']),
    meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
    /** UI sets true when a photo is selected so empty text is allowed. */
    has_image: z.boolean().optional(),
  })
  .refine((v) => Boolean((v.text && v.text.length > 0) || v.has_image), {
    message: 'Enter a food name or add a photo',
    path: ['text'],
  })

export type MealLogFormValues = z.infer<typeof mealLogFormSchema>
