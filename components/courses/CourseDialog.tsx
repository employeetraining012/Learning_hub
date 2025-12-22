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
import { Textarea } from '@/components/ui/textarea'
import { createCourse, updateCourse } from '@/app/t/[tenantSlug]/admin/courses/actions'
import { toast } from 'sonner'
import { Course } from '@/types/db'
import { useParams } from 'next/navigation'

export function CourseDialog({ 
    course, 
    trigger,
    tenantId
}: { 
    course?: Course, 
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
    if (course) {
        result = await updateCourse(course.id, formData, tenantId || course.tenant_id, tenantSlug)
    } else {
        if (!tenantId) {
            toast.error('Missing tenant ID')
            setLoading(false)
            return
        }
        result = await createCourse(formData, tenantId, tenantSlug)
    }

    setLoading(false)

    if (result?.error) {
        toast.error(result.error)
    } else {
        toast.success(course ? 'Course updated' : 'Course created')
        setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Create Course</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{course ? 'Edit Course' : 'Create Course'}</DialogTitle>
          <DialogDescription>
            {course ? 'Update course details below.' : 'Add a new course to the catalog.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={course?.title} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={course?.description || ''} />
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
