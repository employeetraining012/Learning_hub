'use client'

import { useState } from 'react'
import { deleteModule } from '@/app/t/[tenantSlug]/admin/courses/[courseId]/modules/actions'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { ModuleDialog } from '@/components/modules/ModuleDialog'
import { Module } from '@/types/db'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ROUTES } from '@/lib/config/routes'

export function ModuleActions({ module, courseId }: { module: Module, courseId: string }) {
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const tenantSlug = params.tenantSlug as string

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this module?')) return
    
    setLoading(true)
    const result = await deleteModule(module.id, courseId, module.tenant_id, tenantSlug)
    setLoading(false)
    
    if (result?.error) {
        toast.error(result.error)
    } else {
        toast.success('Module deleted')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={ROUTES.tenant(tenantSlug).admin.content(module.id)}>Manage Content</Link>
      </Button>
      <ModuleDialog module={module} courseId={courseId} tenantId={module.tenant_id} trigger={<Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>} />
      <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}
