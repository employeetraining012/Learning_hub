import { createServiceRoleClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/tenant/context'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import { ChevronRight } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

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

    // Filter to only employees (not admins)
    const employeeList = employees
        ?.filter((e: any) => e.profiles.role === 'employee')
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

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-center">Courses Assigned</TableHead>
                            <TableHead className="text-center">Items Completed</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employeesWithStats.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No employees found.
                                </TableCell>
                            </TableRow>
                        )}
                        {employeesWithStats.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell className="font-medium">{employee.full_name || 'Unnamed'}</TableCell>
                                <TableCell>{employee.email}</TableCell>
                                <TableCell className="text-center">{employee.courses_assigned}</TableCell>
                                <TableCell className="text-center">{employee.items_completed}</TableCell>
                                <TableCell className="text-right">
                                    <Link 
                                        href={ROUTES.tenant(tenantSlug).admin.employeeProgress(employee.id)}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View Details <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
