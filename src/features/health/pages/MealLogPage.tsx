import { Link } from 'react-router-dom'
import { GrgShell } from '@/shared/ui/GrgShell'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { useMealLog } from '../hooks/useMealLog'
import { MealLogForm } from '../components/MealLogForm'
import { ResolvePreview } from '../components/ResolvePreview'
import type { FoodUnit } from '../types'

export function MealLogPage() {
  const signOut = useAuthStore((s) => s.signOut)
  const {
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
    resolving,
    confirming,
  } = useMealLog()

  const values = form.watch()
  const textError = form.formState.errors.text?.message

  return (
    <GrgShell
      brand="iVelox"
      nav={
        <>
          <Link to="/health">← Health</Link>
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </>
      }
      narrow
      narrowSm
    >
      <p className="grg-eyebrow">Health</p>
      <h1>Log a meal</h1>
      <p className="grg-lead">Describe what you ate — resolve macros, then confirm.</p>

      <div className="grg-panel">
        {preview ? (
          <ResolvePreview
            items={scaledItems}
            source={preview.source}
            notes={preview.notes}
            quantity={previewQty}
            unit={values.unit}
            confirming={confirming}
            onQuantityChange={setPreviewQty}
            onConfirm={() => {
              void onConfirm()
            }}
            onBack={onBack}
          />
        ) : (
          <MealLogForm
            text={values.text ?? ''}
            quantity={values.quantity}
            unit={values.unit}
            mealType={values.meal_type}
            imageName={imageFile?.name}
            error={textError}
            submitting={resolving}
            onTextChange={(v) => form.setValue('text', v, { shouldValidate: true })}
            onQuantityChange={(v) => form.setValue('quantity', v, { shouldValidate: true })}
            onUnitChange={(v: FoodUnit) => form.setValue('unit', v, { shouldValidate: true })}
            onMealTypeChange={(v) => form.setValue('meal_type', v, { shouldValidate: true })}
            onImageChange={setImage}
            onSubmit={() => {
              void onResolve()
            }}
          />
        )}
      </div>
    </GrgShell>
  )
}
