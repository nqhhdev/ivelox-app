import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthListener } from '@/shared/hooks/useAuth'
import '@/shared/i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useAuthListener()
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>{children}</AuthBootstrap>
      <Toaster
        position="top-right"
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgb(3, 9, 11)',
            border: '1px solid rgb(11, 57, 84)',
            color: 'rgb(238, 240, 242)',
            fontFamily: "'Work Sans', Lato, sans-serif",
          },
        }}
      />
    </QueryClientProvider>
  )
}
