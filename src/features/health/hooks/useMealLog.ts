import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/shared/hooks/useToast'
import { mealLogFormSchema, parseQuantity, type MealLogFormValues } from '../schemas/meal.schemas'
import type { FoodItem, ResolveResult } from '../types'
import { localISODate } from '../lib/date'
import { useFoodResolve } from './useFoodResolve'
import { useMeals } from './useMeals'

export async function fileToBase64(file: File): Promise<{ image_base64: string; image_mime: string }> {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return { image_base64: btoa(binary), image_mime: file.type || 'image/jpeg' }
}

function scaleItems(items: FoodItem[], fromQty: number, toQty: number): FoodItem[] {
  const scale = fromQty > 0 ? toQty / fromQty : 1
  return items.map((item) => ({
    ...item,
    quantity: item.quantity * scale,
    kcal: item.kcal * scale,
    protein_g: item.protein_g * scale,
    carb_g: item.carb_g * scale,
    fat_g: item.fat_g * scale,
  }))
}

function sumMacros(items: FoodItem[]) {
  return items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      protein_g: acc.protein_g + item.protein_g,
      carb_g: acc.carb_g + item.carb_g,
      fat_g: acc.fat_g + item.fat_g,
    }),
    { kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0 },
  )
}

export function useMealLog(opts?: { onLogged?: () => void; embedded?: boolean }) {
  const date = localISODate()
  const navigate = useNavigate()
  const toast = useToast()
  const resolve = useFoodResolve()
  const meals = useMeals(date)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ResolveResult | null>(null)
  const [resolveQty, setResolveQty] = useState(1)
  const [previewQty, setPreviewQty] = useState(1)

  const form = useForm<MealLogFormValues>({
    resolver: zodResolver(mealLogFormSchema),
    defaultValues: {
      text: '',
      quantity: '1',
      unit: 'serving',
      meal_type: undefined,
      has_image: false,
    },
  })

  const setImage = (file: File | null) => {
    setImageFile(file)
    form.setValue('has_image', Boolean(file), { shouldValidate: true })
  }

  const scaledItems = useMemo(
    () => (preview ? scaleItems(preview.items, resolveQty, previewQty) : []),
    [preview, resolveQty, previewQty],
  )

  const onResolve = form.handleSubmit(async (data) => {
    const { has_image: _omit, ...fields } = data
    void _omit

    let image: { image_base64: string; image_mime: string } | undefined
    if (imageFile) {
      image = await fileToBase64(imageFile)
    }

    try {
      const qty = parseQuantity(fields.quantity)
      const result = await resolve.mutateAsync({
        text: fields.text || undefined,
        quantity: qty,
        unit: fields.unit,
        ...image,
      })
      if (!result.items?.length) {
        toast.error(new Error('No foods found. Try a different description or photo.'))
        return
      }
      setResolveQty(qty)
      setPreviewQty(qty)
      setPreview(result)
    } catch (e) {
      toast.error(e, 'Could not resolve food.')
    }
  })

  const onConfirm = async () => {
    if (!preview) return
    const values = form.getValues()
    const totals = sumMacros(scaledItems)
    const raw = (values.text ?? '').trim() || preview.items.map((i) => i.name).join(', ')

    try {
      let image: { image_base64: string; image_mime: string } | undefined
      if (imageFile) {
        image = await fileToBase64(imageFile)
      }
      await meals.create.mutateAsync({
        raw_input: raw,
        quantity: previewQty,
        unit: values.unit,
        kcal: totals.kcal,
        protein_g: totals.protein_g,
        carb_g: totals.carb_g,
        fat_g: totals.fat_g,
        ...(values.meal_type ? { meal_type: values.meal_type } : {}),
        ...image,
      })
      toast.success('Meal logged')
      setPreview(null)
      setImage(null)
      form.reset()
      opts?.onLogged?.()
      if (!opts?.embedded) {
        navigate('/health')
      }
    } catch (e) {
      toast.error(e, 'Could not save meal.')
    }
  }

  const onBack = () => setPreview(null)

  return {
    form,
    imageFile,
    setImage,
    preview,
    previewQty,
    setPreviewQty,
    scaledItems,
    onResolve,
    onConfirm,
    onBack,
    resolving: resolve.isPending,
    confirming: meals.create.isPending,
  }
}
