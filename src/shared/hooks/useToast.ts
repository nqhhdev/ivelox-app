import { toast } from 'sonner'

export function useToast() {
  const success = (msg: string) => toast.success(msg)

  const error = (e: unknown, fallback = 'Something went wrong. Please try again.') => {
    const msg = e instanceof Error ? e.message : fallback
    toast.error(msg)
    return msg
  }

  const info = (msg: string) => toast.info(msg)

  return { success, error, info }
}
