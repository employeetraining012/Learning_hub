import { createClient } from '@/lib/supabase/server'
import { ContentDialog } from '@/components/content/ContentDialog'
import { ContentActions } from '@/components/content/ContentActions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, FileText, Link as LinkIcon, Video, Presentation } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const TYPE_ICONS = {
    youtube: Video,
    pdf: FileText,
    ppt: Presentation,
    link: LinkIcon,
    doc: FileText,
    image: FileText, // Could use Image icon if imported
    video: Video,
    zip: FileText
}

import { getTenantContext } from '@/lib/tenant/context'
import { notFound } from 'next/navigation'
import { ROUTES } from '@/lib/config/routes'

export default async function ContentPage({ params }: { params: Promise<{ tenantSlug: string, moduleId: string }> }) {
  const { tenantSlug, moduleId } = await params
  const tenant = await getTenantContext(tenantSlug)
  if (!tenant) notFound()

  const supabase = await createClient()

  // We need module info + course info for breadcrumbs.
  const { data: moduleData } = await supabase
    .from('modules')
    .select('*, courses(id, title)')
    .eq('id', moduleId)
    .eq('tenant_id', tenant.id)
    .single()

  const { data: contentItems } = await supabase
    .from('content_items')
    .select('*')
    .eq('module_id', moduleId)
    .eq('tenant_id', tenant.id)
    .order('sort_order', { ascending: true })

  // Type assertion for joined data if not fully typed
  const moduleInfo = moduleData as any
  const course = moduleInfo?.courses

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 pl-0 hover:bg-transparent">
            {course ? (
                <Link href={ROUTES.tenant(tenantSlug).admin.modules(course.id)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Modules
                </Link>
            ) : (
                 <Link href={ROUTES.tenant(tenantSlug).admin.courses} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Courses
                </Link>
            )}
        </Button>
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
                {moduleInfo?.title || 'Module'} / Content
            </h1>
            <ContentDialog moduleId={moduleId} tenantId={tenant.id} />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[80px]">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>URL / Path</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contentItems?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        No content found. Add items.
                    </TableCell>
                </TableRow>
            )}
            {contentItems?.map((item) => {
                const Icon = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] || LinkIcon
                return (
                <TableRow key={item.id}>
                    <TableCell>
                        <Icon className="w-4 h-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>{item.sort_order}</TableCell>
                    <TableCell className="font-medium max-w-[200px] break-words">{item.title}</TableCell>
                    <TableCell className="capitalize">{item.type}</TableCell>
                    <TableCell className="capitalize">{item.content_source}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.content_source === 'storage' ? item.storage_path : item.url}>
                        {item.content_source === 'storage' ? item.storage_path : item.url}
                    </TableCell>
                    <TableCell className="text-right">
                        <ContentActions content={item} moduleId={moduleId} tenantId={tenant.id} />
                    </TableCell>
                </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
