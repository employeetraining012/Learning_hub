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
import { createModule, updateModule } from '@/app/t/[tenantSlug]/admin/courses/[courseId]/modules/actions'
import { toast } from 'sonner'
import { Module } from '@/types/db'
import { useParams } from 'next/navigation'

export function ModuleDialog({ 
    courseId, 
    module, 
    trigger,
    tenantId
}: { 
    courseId: string, 
    module?: Module, 
    trigger?: React.ReactNode,
    tenantId?: string 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const tenantSlug = params.tenantSlug as string

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)

    let result
    if (module) {
        result = await updateModule(module.id, courseId, formData, tenantId || module.tenant_id, tenantSlug)
    } else {
        if (!tenantId) {
            toast.error('Missing tenant ID')
            setLoading(false)
            return
        }
        result = await createModule(courseId, formData, tenantId, tenantSlug)
    }

    setLoading(false)

    if (result?.error) {
        toast.error(result.error)
    } else {
        toast.success(module ? 'Module updated' : 'Module created')
        setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Module</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{module ? 'Edit Module' : 'Add Module'}</DialogTitle>
          <DialogDescription>
            {module ? 'Update module details.' : 'Add a new module to this course.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={module?.title} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" defaultValue={module?.description || ''} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input id="sort_order" name="sort_order" type="number" defaultValue={module?.sort_order ?? 1} required />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
