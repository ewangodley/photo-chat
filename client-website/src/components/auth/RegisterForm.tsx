'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export function RegisterForm() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await register(username, email, password)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Registration failed')
    }
    
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </Button>
      </form>
      
      <p className="text-center mt-4 text-sm">
        Already have an account?{' '}
        <a href="/auth/login" className="text-blue-500 hover:underline">
          Login
        </a>
      </p>
    </Card>
  )
}