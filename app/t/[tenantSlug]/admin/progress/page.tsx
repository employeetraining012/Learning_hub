import { createServiceRoleClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/tenant/context'
import { notFound } from 'next/navigation'
import { ProgressTrackingClient } from '@/components/admin/ProgressTrackingClient'

export const dynamic = 'force-dynamic'

export default async function ProgressTrackingPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
    const { tenantSlug } = await params
    const tenant = await getTenantContext(tenantSlug)
    if (!tenant) notFound()

    const adminClient = createServiceRoleClient()

    // Get all employees in this tenant
    const { data: employees } = await adminClient
        .from('tenant_memberships')
        .select(`
            profiles!inner (
                id,
                full_name,
                email,
                role
            )
        `)
        .eq('tenant_id', tenant.id)

    // Filter to only employees (not admins/owners)
    const employeeList = employees
        ?.filter((e: any) => {
            const role = String(e.profiles.role || '').toLowerCase().trim()
            return role === 'employee'
        })
        .map((e: any) => ({
            id: e.profiles.id,
            full_name: e.profiles.full_name,
            email: e.profiles.email
        })) || []

    // Get stats for each employee
    const employeesWithStats = await Promise.all(
        employeeList.map(async (employee) => {
            // Get assigned courses count
            const { count: coursesCount } = await adminClient
                .from('employee_course_assignments')
                .select('*', { count: 'exact', head: true })
                .eq('employee_id', employee.id)
                .eq('tenant_id', tenant.id)

            // Get completed content count
            const { count: completedCount } = await adminClient
                .from('content_progress')
                .select('*', { count: 'exact', head: true })
                .eq('employee_id', employee.id)
                .eq('tenant_id', tenant.id)
                .eq('completed', true)

            return {
                ...employee,
                courses_assigned: coursesCount || 0,
                items_completed: completedCount || 0
            }
        })
    )

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Track Progress</h1>
                <p className="text-muted-foreground mt-2">Monitor employee learning progress across all courses.</p>
            </div>

            <ProgressTrackingClient employees={employeesWithStats} tenantSlug={tenantSlug} />
        </div>
    )
}
