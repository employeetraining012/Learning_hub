import { createClient } from '@/lib/supabase/server'
import { ModuleDialog } from '@/components/modules/ModuleDialog'
import { ModuleActions } from '@/components/modules/ModuleActions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { getTenantContext } from '@/lib/tenant/context'
import { notFound } from 'next/navigation'
import { ROUTES } from '@/lib/config/routes'

export default async function ModulesPage({ params }: { params: Promise<{ tenantSlug: string, courseId: string }> }) {
  const { tenantSlug, courseId } = await params
  const tenant = await getTenantContext(tenantSlug)
  if (!tenant) notFound()

  const supabase = await createClient()

  const [courseRes, modulesRes] = await Promise.all([
      supabase.from('courses').select('title').eq('id', courseId).eq('tenant_id', tenant.id).single(),
      supabase.from('modules').select('*').eq('course_id', courseId).eq('tenant_id', tenant.id).order('sort_order', { ascending: true })
  ])
  
  const course = courseRes.data
  const modules = modulesRes.data

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 pl-0 hover:bg-transparent">
            <Link href={ROUTES.tenant(tenantSlug).admin.courses} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4" />
                Back to Courses
            </Link>
        </Button>
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
                {course?.title || 'Course'} / Modules
            </h1>
            <ModuleDialog courseId={courseId} tenantId={tenant.id} />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No modules found. Add one.
                    </TableCell>
                </TableRow>
            )}
            {modules?.map((module) => (
              <TableRow key={module.id}>
                <TableCell>{module.sort_order}</TableCell>
                <TableCell className="font-medium">{module.title}</TableCell>
                <TableCell className="max-w-[400px] break-words whitespace-pre-wrap">
                    {module.description}
                </TableCell>
                <TableCell>{new Date(module.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                    <ModuleActions module={module} courseId={courseId} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
