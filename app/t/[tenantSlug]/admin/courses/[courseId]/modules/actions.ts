'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logAudit } from '@/lib/admin/audit'
import { ROUTES } from '@/lib/config/routes'

const moduleSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    sort_order: z.coerce.number().int().default(1),
})

export async function createModule(courseId: string, formData: FormData, tenantId: string, tenantSlug: string) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || undefined
    const sort_order = formData.get('sort_order')

    const validation = moduleSchema.safeParse({ title, description, sort_order })
    if (!validation.success) {
        return { error: validation.error.message }
    }

    const { data: newModule, error } = await supabase
        .from('modules')
        .insert({
            course_id: courseId,
            tenant_id: tenantId,
            title,
            description,
            sort_order: validation.data.sort_order
        })
        .select('id')
        .single()

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'MODULE_CREATE',
        entityType: 'module',
        entityId: newModule.id,
        metadata: { title, courseId, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.modules(courseId))
    return { success: true }
}

export async function updateModule(id: string, courseId: string, formData: FormData, tenantId: string, tenantSlug: string) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || undefined
    const sort_order = formData.get('sort_order')

    const validation = moduleSchema.safeParse({ title, description, sort_order })
    if (!validation.success) {
        return { error: validation.error.message }
    }

    const { error } = await supabase
        .from('modules')
        .update({
            title,
            description,
            sort_order: validation.data.sort_order
        })
        .eq('id', id)

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'MODULE_UPDATE',
        entityType: 'module',
        entityId: id,
        metadata: { title, courseId, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.modules(courseId))
    return { success: true }
}

export async function deleteModule(id: string, courseId: string, tenantId: string, tenantSlug: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('modules').delete().eq('id', id)

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'MODULE_DELETE',
        entityType: 'module',
        entityId: id,
        metadata: { courseId, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.modules(courseId))
    return { success: true }
}
