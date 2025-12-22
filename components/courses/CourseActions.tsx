'use client'

import { useState } from 'react'
import { deleteCourse } from '@/app/t/[tenantSlug]/admin/courses/actions'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { CourseDialog } from '@/components/courses/CourseDialog'
import { Course } from '@/types/db'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ROUTES } from '@/lib/config/routes'

export function CourseActions({ course }: { course: Course }) {
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const tenantSlug = params.tenantSlug as string

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course? All modules and content will be lost.')) return
    
    setLoading(true)
    const result = await deleteCourse(course.id, course.tenant_id, tenantSlug)
    setLoading(false)
    
    if (result?.error) {
        toast.error(result.error)
    } else {
        toast.success('Course deleted')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={ROUTES.tenant(tenantSlug).admin.modules(course.id)}>Manage Modules</Link>
      </Button>
      <CourseDialog course={course} tenantId={course.tenant_id} trigger={<Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>} />
      <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}
