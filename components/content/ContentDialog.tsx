'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createContent, updateContent } from '@/app/t/[tenantSlug]/admin/modules/[moduleId]/content/actions'
import { toast } from 'sonner'
import { ContentItem } from '@/types/db'
import { useParams } from 'next/navigation'
import { uploadContentFile } from '@/lib/storage/upload'
import { ExternalLink } from 'lucide-react'

export function ContentDialog({
  moduleId,
  content,
  trigger,
  tenantId,
  nextOrder
}: {
  moduleId: string,
  content?: ContentItem,
  trigger?: React.ReactNode,
  tenantId?: string,
  nextOrder?: number
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState(content?.type || 'link')
  const [source, setSource] = useState<'external' | 'storage'>(content?.content_source || 'external')
  const [storagePath, setStoragePath] = useState(content?.storage_path || '')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  const params = useParams()
  const tenantSlug = params.tenantSlug as string

  const defaultOrder = content?.sort_order ?? (nextOrder || 1)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const result = await uploadContentFile(moduleId, tenantId || '', file)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else if (result.path) {
      setStoragePath(result.path)
      toast.success('File uploaded successfully')
    }
  }

  const handlePreview = () => {
    const urlInput = document.getElementById('url') as HTMLInputElement
    const url = urlInput?.value || content?.url || ''

    if (!url) {
      toast.error('Please enter a URL first')
      return
    }

    setPreviewUrl(url)
    setPreviewOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    formData.set('type', type) // Ensure type is explicitly set

    if (source === 'storage') {
      formData.append('storage_path', storagePath)
      formData.append('content_source', 'storage')
    }

    let result
    if (content) {
      result = await updateContent(content.id, moduleId, formData, tenantId || '', tenantSlug)
    } else {
      if (!tenantId) {
        toast.error('Missing tenant ID')
        setLoading(false)
        return
      }
      result = await createContent(moduleId, formData, tenantId, tenantSlug)
    }

    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(content ? 'Content updated' : 'Content added')
      setOpen(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button>Add Content</Button>}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{content ? 'Edit Content' : 'Add Content'}</DialogTitle>
            <DialogDescription>
              {content ? 'Update content details.' : 'Add a new resource to this module.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={content?.title} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="ppt">PPT</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    name="url"
                    type="text"
                    defaultValue={content?.url || ''}
                    required
                    placeholder="https://"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handlePreview}
                    title="Preview Content"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <input type="hidden" name="type" value={type} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Content Preview</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Preview of: {previewUrl}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Content Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
