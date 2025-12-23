'use client'

import { useState } from 'react'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    
    // Server action
    const result = await login(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Log in</h1>
        <p className="text-gray-500">
          Don't have an account? <Link href={ROUTES.signup} className="font-medium text-black underline underline-offset-4 hover:text-gray-900">Create an Account</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
            <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                className="h-12 rounded-full border-gray-300 focus:border-black focus:ring-black px-4"
            />
          </div>
          
          <div className="space-y-2">
             <div className="relative">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative mt-1">
                    <Input 
                        id="password" 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        required 
                        className="h-12 rounded-full border-gray-300 focus:border-black focus:ring-black px-4 pr-10"
                        placeholder="Password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
             </div>
             <div className="flex justify-end">
                <Link href={ROUTES.forgotPassword} className="text-xs font-semibold text-gray-900 hover:underline">
                    Forgot Password?
                </Link>
             </div>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 rounded-full bg-black text-white hover:bg-gray-800 text-base font-medium" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    </div>
  )
}
