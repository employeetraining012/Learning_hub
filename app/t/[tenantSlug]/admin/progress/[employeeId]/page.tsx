import { createServiceRoleClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/tenant/context'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmployeeCourseCard } from '@/components/admin/EmployeeCourseCard'

// Progress Bar Component moved to EmployeeCourseCard

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
                title
            )
        `)
        .eq('employee_id', employeeId)
        .eq('tenant_id', tenant.id)

    // Calculate progress for each course with detailed module breakdown
    const coursesWithProgress = await Promise.all(
        (assignments || []).map(async (assignment: any) => {
            const course = assignment.courses

            // Get modules for this course
            const { data: modules } = await adminClient
                .from('modules')
                .select('id, title, sort_order')
                .eq('course_id', course.id)
                .order('sort_order')

            if (!modules || modules.length === 0) {
                return {
                    ...course,
                    progress_percentage: 0,
                    completed: 0,
                    total: 0,
                    modules: []
                }
            }

            // Get content items and progress for each module
            const modulesWithProgress = await Promise.all(
                modules.map(async (module) => {
                    const { data: contentItems } = await adminClient
                        .from('content_items')
                        .select('id, title')
                        .eq('module_id', module.id)
                        .order('created_at')

                    const contentItemIds = contentItems?.map(c => c.id) || []

                    if (contentItemIds.length === 0) {
                        return {
                            ...module,
                            total_items: 0,
                            completed_items: 0,
                            content_details: []
                        }
                    }

                    // Get progress for each content item
                    const { data: progressData } = await adminClient
                        .from('content_progress')
                        .select('content_item_id, completed')
                        .eq('employee_id', employeeId)
                        .in('content_item_id', contentItemIds)

                    const progressMap: Record<string, boolean> = {}
                    progressData?.forEach(p => {
                        progressMap[p.content_item_id] = p.completed
                    })

                    const contentDetails = contentItems?.map(item => ({
                        id: item.id,
                        title: item.title,
                        completed: progressMap[item.id] || false
                    })) || []

                    const completedCount = contentDetails.filter(c => c.completed).length

                    return {
                        ...module,
                        total_items: contentDetails.length,
                        completed_items: completedCount,
                        content_details: contentDetails
                    }
                })
            )

            const totalItems = modulesWithProgress.reduce((sum, m) => sum + m.total_items, 0)
            const completedItems = modulesWithProgress.reduce((sum, m) => sum + m.completed_items, 0)
            const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

            return {
                ...course,
                progress_percentage: percentage,
                completed: completedItems,
                total: totalItems,
                modules: modulesWithProgress
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

            {coursesWithProgress.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No courses assigned to this employee.
                </div>
            )}

            {coursesWithProgress.map((course) => (
                <EmployeeCourseCard key={course.id} course={course} />
            ))}
        </div>
    )
}
