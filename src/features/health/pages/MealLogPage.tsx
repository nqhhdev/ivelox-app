import { Link } from 'react-router-dom'
import { LogoMark } from '@/shared/ui/LogoMark'
import { tokens } from '@/shared/ui/tokens'
import { useMealLog } from '../hooks/useMealLog'
import { MealLogForm } from '../components/MealLogForm'
import { ResolvePreview } from '../components/ResolvePreview'
import type { FoodUnit } from '../types'

export function MealLogPage() {
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
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #2a1456 0%, #0f0a1a 60%)',
      fontFamily: tokens.font,
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 32px',
        background: 'rgba(15,10,26,0.75)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Link to="/" style={{ display: 'flex', textDecoration: 'none' }}>
          <LogoMark width={160} />
        </Link>
        <Link
          to="/health"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.55)',
            textDecoration: 'none',
          }}
        >
          ← Health
        </Link>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            Health
          </div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>
            Log a meal
          </h1>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16,
          padding: '22px 22px 24px',
          backdropFilter: 'blur(12px)',
        }}>
          {preview ? (
            <ResolvePreview
              items={scaledItems}
              source={preview.source}
              notes={preview.notes}
              quantity={previewQty}
              unit={values.unit}
              confirming={confirming}
              onQuantityChange={setPreviewQty}
              onConfirm={() => { void onConfirm() }}
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
              onQuantityChange={(v) => form.setValue('quantity', Number(v) || 0, { shouldValidate: true })}
              onUnitChange={(v: FoodUnit) => form.setValue('unit', v, { shouldValidate: true })}
              onMealTypeChange={(v) => form.setValue('meal_type', v, { shouldValidate: true })}
              onImageChange={setImage}
              onSubmit={() => { void onResolve() }}
            />
          )}
        </div>
      </main>
    </div>
  )
}
