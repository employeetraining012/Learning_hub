'use client'

import { useState } from 'react'
import { deleteContent } from '@/app/t/[tenantSlug]/admin/modules/[moduleId]/content/actions'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Eye } from 'lucide-react'
import { ContentDialog } from '@/components/content/ContentDialog'
import { ContentItem } from '@/types/db'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function ContentActions({ content, moduleId, tenantId }: { content: ContentItem, moduleId: string, tenantId?: string }) {
  const [loading, setLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
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

  const handlePreview = () => {
    setPreviewOpen(true)
  }

  // Get the URL/path to display
  const contentUrl = content.content_source === 'storage' 
    ? `/api/content/stream?contentItemId=${content.id}` 
    : content.url

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handlePreview}
          title="Preview Content"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <ContentDialog 
          content={content} 
          moduleId={moduleId} 
          tenantId={tenantId}
          trigger={<Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>} 
        />
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{content.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-gray-100">
            {content.type === 'youtube' || contentUrl?.includes('youtube.com') || contentUrl?.includes('youtu.be') ? (
              <iframe 
                src={contentUrl} 
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={content.title}
              />
            ) : (
              <iframe 
                src={contentUrl} 
                className="w-full h-full border-0"
                title={content.title}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
