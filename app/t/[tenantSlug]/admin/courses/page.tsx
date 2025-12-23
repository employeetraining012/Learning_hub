import { createClient } from '@/lib/supabase/server'
import { CourseDialog } from '@/components/courses/CourseDialog'
import { CourseActions } from '@/components/courses/CourseActions'
import { getTenantContext } from '@/lib/tenant/context'
import { notFound } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function CoursesPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
    const { tenantSlug } = await params
    const tenant = await getTenantContext(tenantSlug)
  if (!tenant) notFound()

  const supabase = await createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <CourseDialog tenantId={tenant.id} />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No courses found. Create one.
                    </TableCell>
                </TableRow>
            )}
            {courses?.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell className="max-w-[300px] break-words whitespace-pre-wrap">
                    {course.description}
                </TableCell>
                <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                    <CourseActions course={course} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
