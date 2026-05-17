import { useEffect, useState } from 'react'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { apiClient } from '@/shared/api/client'
import { Button } from '@/components/ui/button'

interface Profile {
  id: string
  display_name: string
  role: string
}

export default function HomePage() {
  const { user, signOut } = useAuthStore()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiClient.post<Profile>('/api/v1/auth/verify')
      .then(setProfile)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">iVelox</h1>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>
        <p className="text-gray-600">Email: {user?.email}</p>
        {profile && <p className="text-gray-600">Role: {profile.role}</p>}
        {error && <p className="text-red-500 text-sm">Backend error: {error}</p>}
      </div>
    </div>
  )
}
