import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { getTenantContext } from '@/lib/tenant/context'
import { ROUTES } from '@/lib/config/routes'
import { notFound, redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const tenant = await getTenantContext(tenantSlug)
  
  if (!tenant) {
      notFound()
  }

  // RBAC: Only allow owner, admin, trainer to access admin routes
  const allowedRoles = ['owner', 'admin', 'trainer']
  if (!allowedRoles.includes(tenant.userRole)) {
    // If user is an employee, redirect them to their dashboard
    redirect(ROUTES.tenant(tenantSlug).employee.dashboard)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
            {children}
        </main>
      </div>
    </div>
  )
}
