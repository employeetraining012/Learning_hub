import { getModuleWithContent } from '@/lib/data/employee'
import { ContentItemList } from '@/components/employee/ContentItemList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ROUTES } from '@/lib/config/routes'

export default async function ModuleDetailPage({ params }: { params: Promise<{ tenantSlug: string, moduleId: string }> }) {
    const { tenantSlug, moduleId } = await params
    const result = await getModuleWithContent(moduleId)

    if (!result) {
        notFound()
    }

    const { module, content } = result
    
    // Type assertion for joined course data
    const course = (module as any).courses
    const courseTitle = course?.title || 'Course'
    const courseId = course?.id

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <nav className="flex items-center text-sm text-muted-foreground mb-4">
                <Link href={ROUTES.tenant(tenantSlug).employee.dashboard} className="hover:underline">Dashboard</Link>
                <span className="mx-2">/</span>
                {courseId ? (
                    <Link href={ROUTES.tenant(tenantSlug).employee.course(courseId)} className="hover:underline truncate max-w-[200px]">
                        {courseTitle}
                    </Link>
                ) : (
                    <span>{courseTitle}</span>
                )}
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium truncate">{module.title}</span>
            </nav>

             <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{module.title}</h1>
                <p className="text-gray-600 break-words whitespace-pre-wrap leading-relaxed">{module.description}</p>
            </div>

            <div>
                 <h2 className="text-lg font-semibold mb-4">Learning Materials</h2>
                 <ContentItemList items={content} courseId={courseId} />
            </div>
        </div>
    )
}
