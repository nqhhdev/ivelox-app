import { mealLogFormSchema } from './meal.schemas'

type RefineCase = {
  name: string
  input: {
    text?: string
    quantity: number
    unit: 'g' | 'ml' | 'serving' | 'piece'
    has_image?: boolean
  }
  ok: boolean
}

const refineCases: RefineCase[] = [
  { name: 'rejects empty text without image', input: { quantity: 1, unit: 'serving' }, ok: false },
  { name: 'accepts text', input: { text: 'pho bo', quantity: 1, unit: 'serving' }, ok: true },
  { name: 'accepts image without text', input: { quantity: 1, unit: 'serving', has_image: true }, ok: true },
]

/** Compile-time + import-time coverage. No test runner is configured in package.json. */
export const mealSchemaRefineResults = refineCases.map((c) => {
  const actual = mealLogFormSchema.safeParse(c.input).success
  return { name: c.name, expected: c.ok, actual, passed: actual === c.ok }
})

export const mealSchemaRefinePassed = mealSchemaRefineResults.every((r) => r.passed)

if (!mealSchemaRefinePassed) {
  const failed = mealSchemaRefineResults.filter((r) => !r.passed).map((r) => r.name)
  throw new Error(`meal schema refine failed: ${failed.join(', ')}`)
}
