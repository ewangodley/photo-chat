'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.username}!
            </h1>
            <p className="text-gray-600">
              {user?.email} • {user?.role}
            </p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Photos</h3>
            <p className="text-gray-600 mb-4">Share and discover photos</p>
            <Button className="w-full">View Photos</Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Chat</h3>
            <p className="text-gray-600 mb-4">Connect with others</p>
            <Button className="w-full">Open Chat</Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Profile</h3>
            <p className="text-gray-600 mb-4">Manage your profile</p>
            <Button className="w-full">Edit Profile</Button>
          </Card>
        </div>
      </div>
    </div>
  )
}