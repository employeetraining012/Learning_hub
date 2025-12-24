import { createServiceRoleClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/tenant/context'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
                <div key={course.id} className="mb-8">
                    <div className="bg-white border rounded-lg overflow-hidden">
                        {/* Course Header */}
                        <div className="bg-gray-50 border-b px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">{course.title}</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {course.completed} of {course.total} items completed
                                    </p>
                                </div>
                                <ProgressBar percentage={course.progress_percentage} />
                            </div>
                        </div>

                        {/* Module Tree View */}
                        <div className="p-6">
                            {course.modules.length === 0 && (
                                <p className="text-gray-500 text-center py-8">No modules in this course yet.</p>
                            )}
                            {course.modules.map((module: any, idx: number) => (
                                <div key={module.id} className="mb-6 last:mb-0">
                                    {/* Module Header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{module.title}</h3>
                                            <p className="text-xs text-gray-500">
                                                {module.completed_items}/{module.total_items} completed
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium text-gray-600">
                                            {module.total_items > 0 
                                                ? `${Math.round((module.completed_items / module.total_items) * 100)}%`
                                                : '0%'
                                            }
                                        </div>
                                    </div>

                                    {/* Content Items */}
                                    {module.content_details.length > 0 && (
                                        <div className="ml-11 space-y-2">
                                            {module.content_details.map((item: any) => (
                                                <div 
                                                    key={item.id} 
                                                    className="flex items-center gap-2 text-sm py-1.5 px-3 rounded hover:bg-gray-50"
                                                >
                                                    {item.completed ? (
                                                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                                    ) : (
                                                        <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                                                    )}
                                                    <span className={item.completed ? 'text-gray-600' : 'text-gray-800'}>
                                                        {item.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {module.content_details.length === 0 && (
                                        <div className="ml-11 text-sm text-gray-400 italic">
                                            No content items yet
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
