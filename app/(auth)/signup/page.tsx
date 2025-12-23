'use client'

import { useState } from 'react'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    
    // Server action
    const result = await signup(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Create an Account</h1>
        <p className="text-gray-500">
          Already have an account? <Link href={ROUTES.login} className="font-medium text-black underline underline-offset-4 hover:text-gray-900">Log in</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input 
                    id="fullName" 
                    name="fullName" 
                    placeholder="John Doe" 
                    required 
                    className="h-12 rounded-full border-gray-300 focus:border-black focus:ring-black px-4"
                />
            </div>

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
          </div>
        </div>

        <Button type="submit" className="w-full h-12 rounded-full bg-black text-white hover:bg-gray-800 text-base font-medium" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
        
        <div className="flex items-center gap-2">
            <input type="checkbox" id="terms" className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" required />
            <label htmlFor="terms" className="text-sm text-gray-500">I agree to the <span className="font-bold text-black cursor-pointer">Terms & Condition</span></label>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" className="h-12 rounded-full border-gray-200 hover:bg-gray-50 flex items-center gap-2 justify-center" disabled>
                 <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                 </svg>
                 <span className="sr-only">Google</span>
                 <span className="text-gray-600 font-medium">Google</span>
            </Button>
            <Button variant="outline" type="button" className="h-12 rounded-full border-gray-200 hover:bg-gray-50 flex items-center gap-2 justify-center" disabled>
                <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="sr-only">Facebook</span>
                 <span className="text-gray-600 font-medium">Facebook</span>
            </Button>
        </div>
      </form>
    </div>
  )
}
