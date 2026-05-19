import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '../schemas/auth.schemas'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { useToast } from '@/shared/hooks/useToast'

export function useLoginForm() {
  const { signInWithGoogle, signInWithEmail } = useAuthStore()
  const toast = useToast()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await signInWithEmail(data.email, data.password)
    } catch (e) {
      toast.error(e, 'Invalid email or password.')
    }
  })

  const onGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (e) {
      toast.error(e, 'Google sign-in failed.')
    }
  }

  return { form, onSubmit, onGoogle }
}
