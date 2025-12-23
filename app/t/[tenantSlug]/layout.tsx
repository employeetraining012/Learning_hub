import { createClient } from '@/lib/supabase/server'
import { getTenantContext } from '@/lib/tenant/context'
import { ROUTES } from '@/lib/config/routes'
import { redirect } from 'next/navigation'

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  
  // 1. Validate Tenant & Membership via Server Context
  // This replaces the database logic that was removed from middleware
  const context = await getTenantContext(tenantSlug)

  if (!context) {
    // Context is null if: tenant missing/inactive OR user not logged in OR user not member
    
    // Check if user is logged in to decide redirect
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        // Not logged in -> Go to Login
        redirect(ROUTES.login)
    } else {
        // Logged in but invalid tenant/membership -> Go to Setup/Portal
        redirect(ROUTES.setup)
    }
  }

  // 2. If valid, render children
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
