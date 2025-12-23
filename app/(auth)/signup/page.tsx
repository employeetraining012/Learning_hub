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
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    
    // Simulate API call for request
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSubmitted(true)
    setLoading(false)
    toast.success("Request submitted successfully!")
  }

  if (submitted) {
     return (
        <div className="w-full space-y-8 animate-in fade-in duration-500 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Request Sent!</h1>
            <p className="text-gray-500">
                Your request to join Learning Hub has been sent to the administrator. You will receive an email once your account is created.
            </p>
            <Button className="w-full h-12 rounded-full bg-black text-white hover:bg-gray-800" asChild>
                <Link href={ROUTES.login}>Back to Login</Link>
            </Button>
        </div>
     )
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Request Access</h1>
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
          
           {/* Password field removed */}
        </div>

        <Button type="submit" className="w-full h-12 rounded-full bg-black text-white hover:bg-gray-800 text-base font-medium" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </div>
  )
}
