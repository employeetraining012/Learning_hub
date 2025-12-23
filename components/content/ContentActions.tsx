'use client'

import { useState } from 'react'
import { deleteContent } from '@/app/t/[tenantSlug]/admin/modules/[moduleId]/content/actions'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, ExternalLink } from 'lucide-react'
import { ContentDialog } from '@/components/content/ContentDialog'
import { ContentItem } from '@/types/db'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export function ContentActions({ content, moduleId, tenantId }: { content: ContentItem, moduleId: string, tenantId?: string }) {
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const tenantSlug = params.tenantSlug as string

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    setLoading(true)
    const result = await deleteContent(content.id, moduleId, tenantId || '', tenantSlug)
    setLoading(false)
    
    if (result?.error) {
        toast.error(result.error)
    } else {
        toast.success('Item deleted')
    }
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <ContentDialog content={content} moduleId={moduleId} trigger={<Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>} />
      <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}
