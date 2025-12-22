'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logAudit } from '@/lib/admin/audit'
import { ROUTES } from '@/lib/config/routes'

const courseSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
})

export async function createCourse(formData: FormData, tenantId: string, tenantSlug: string) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || undefined

    const validation = courseSchema.safeParse({ title, description })
    if (!validation.success) {
        return { error: helperZodError(validation.error) }
    }

    const { data: newCourse, error } = await supabase
        .from('courses')
        .insert({ title, description, tenant_id: tenantId, status: 'draft' })
        .select('id')
        .single()

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'COURSE_CREATE',
        entityType: 'course',
        entityId: newCourse.id,
        metadata: { title, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.courses)
    return { success: true }
}

export async function updateCourse(id: string, formData: FormData, tenantId: string, tenantSlug: string) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || undefined

    const validation = courseSchema.safeParse({ title, description })
    if (!validation.success) {
        return { error: helperZodError(validation.error) }
    }

    const { error } = await supabase
        .from('courses')
        .update({ title, description })
        .eq('id', id)

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'COURSE_UPDATE',
        entityType: 'course',
        entityId: id,
        metadata: { title, description, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.courses)
    return { success: true }
}

export async function deleteCourse(id: string, tenantId: string, tenantSlug: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('courses').delete().eq('id', id)

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'COURSE_DELETE',
        entityType: 'course',
        entityId: id,
        metadata: { tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.courses)
    return { success: true }
}

function helperZodError(error: z.ZodError) {
    return error.issues.map(e => e.message).join(', ')
}
