'use client'

import { useActionState } from 'react'
import { requestPasswordReset } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(requestPasswordReset, null)

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
             <div className="space-y-4">
                <Link href={ROUTES.login} className="text-gray-500 hover:text-black">
                     <ArrowLeft className="h-6 w-6" />
                </Link>
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Forgot Password</h1>
                    <p className="text-gray-500">
                        We'll send a verification code to your email address
                    </p>
                </div>
            </div>

            <form action={formAction} className="space-y-6">
                {state?.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                )}
                 {state?.message && !state?.error && (
                     <Alert className="border-green-200 bg-green-50 text-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>{state.message}</AlertDescription>
                    </Alert>
                )}
                
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                    <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        placeholder="name@company.com"
                        className="h-12 rounded-full border-gray-300 focus:border-black focus:ring-black px-4"
                    />
                </div>

                <Button type="submit" className="w-full h-12 rounded-full bg-black text-white hover:bg-gray-800 text-base font-medium" disabled={isPending}>
                    {isPending ? 'Sending Request...' : 'Send Request'}
                </Button>
            </form>
        </div>
    )
}
