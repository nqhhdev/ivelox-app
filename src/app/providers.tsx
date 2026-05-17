import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthListener } from '@/shared/hooks/useAuth'

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
    </QueryClientProvider>
  )
}
