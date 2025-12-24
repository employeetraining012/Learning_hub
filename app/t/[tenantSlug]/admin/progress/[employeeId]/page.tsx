import { createServiceRoleClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/tenant/context'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

// Progress Bar Component
function ProgressBar({ percentage }: { percentage: number }) {
    const getColor = () => {
        if (percentage === 100) return 'bg-green-500'
        if (percentage >= 50) return 'bg-blue-500'
        if (percentage > 0) return 'bg-yellow-500'
        return 'bg-gray-300'
    }

    return (
        <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${getColor()} transition-all`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-sm font-medium text-gray-700 w-12">{percentage}%</span>
        </div>
    )
}

export default async function EmployeeProgressPage({ 
    params 
}: { 
    params: Promise<{ tenantSlug: string, employeeId: string }> 
}) {
    const { tenantSlug, employeeId } = await params
    const tenant = await getTenantContext(tenantSlug)
    if (!tenant) notFound()

    const adminClient = createServiceRoleClient()

    // Get employee profile
    const { data: profile } = await adminClient
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', employeeId)
        .single()

    if (!profile) notFound()

    // Get assigned courses
    const { data: assignments } = await adminClient
        .from('employee_course_assignments')
        .select(`
            courses (
                id,
                title,
                description
            )
        `)
        .eq('employee_id', employeeId)
        .eq('tenant_id', tenant.id)

    // Calculate progress for each course
    const coursesWithProgress = await Promise.all(
        (assignments || []).map(async (assignment: any) => {
            const course = assignment.courses

            // Get modules for this course
            const { data: modules } = await adminClient
                .from('modules')
                .select('id')
                .eq('course_id', course.id)

            if (!modules || modules.length === 0) {
                return {
                    ...course,
                    progress_percentage: 0,
                    completed: 0,
                    total: 0
                }
            }

            const moduleIds = modules.map(m => m.id)

            // Get content items count
            const { data: contentItems } = await adminClient
                .from('content_items')
                .select('id')
                .in('module_id', moduleIds)

            const total = contentItems?.length || 0

            if (total === 0) {
                return {
                    ...course,
                    progress_percentage: 0,
                    completed: 0,
                    total: 0
                }
            }

            const contentItemIds = contentItems?.map(c => c.id) || []

            // Get completed count
            const { count: completedCount } = await adminClient
                .from('content_progress')
                .select('*', { count: 'exact', head: true })
                .eq('employee_id', employeeId)
                .eq('completed', true)
                .in('content_item_id', contentItemIds)

            const completed = completedCount || 0
            const percentage = Math.round((completed / total) * 100)

            return {
                ...course,
                progress_percentage: percentage,
                completed,
                total
            }
        })
    )

    return (
        <div className="p-8">
            <div className="mb-8">
                <Link href={ROUTES.tenant(tenantSlug).admin.progress}>
                    <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to All Employees
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">{profile.full_name || 'Employee'}</h1>
                <p className="text-muted-foreground mt-1">{profile.email}</p>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead className="text-center">Completed</TableHead>
                            <TableHead className="text-center">Total Items</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coursesWithProgress.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No courses assigned to this employee.
                                </TableCell>
                            </TableRow>
                        )}
                        {coursesWithProgress.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{course.title}</div>
                                        {course.description && (
                                            <div className="text-xs text-gray-500 line-clamp-1">{course.description}</div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <ProgressBar percentage={course.progress_percentage} />
                                </TableCell>
                                <TableCell className="text-center font-medium">{course.completed}</TableCell>
                                <TableCell className="text-center text-gray-500">{course.total}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
