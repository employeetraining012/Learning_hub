'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logAudit } from '@/lib/admin/audit'
import { ROUTES } from '@/lib/config/routes'

const contentSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    url: z.string().trim().min(1, "URL is required").optional().or(z.literal("")),
    type: z.enum(['youtube', 'pdf', 'ppt', 'link', 'video', 'image']),
    content_source: z.enum(['external', 'storage']).default('external'),
    storage_path: z.string().optional(),
})

export async function createContent(moduleId: string, formData: FormData, tenantId: string, tenantSlug: string) {
    const supabase = await createClient()

    const title = (formData.get('title') as string || '').trim()
    const url = (formData.get('url') as string || '').trim()
    const rawType = formData.get('type')
    const type = rawType ? rawType.toString() : null
    const content_source = (formData.get('content_source') as any) || 'external'
    const storage_path = (formData.get('storage_path') as string) || undefined
    const sort_order = formData.get('sort_order')

    // Check for required fields before validation
    if (!type) {
        return { error: 'Content type is required' }
    }

    const validation = contentSchema.extend({ sort_order: z.coerce.number().int().default(0) }).safeParse({
        title,
        url: url || undefined,
        type,
        content_source,
        storage_path,
        sort_order
    })
    if (!validation.success) {
        return { error: helperZodError(validation.error) }
    }

    const order = (validation.data as any).sort_order || 0

    // Rebalance: Shift existing content >= new order
    await supabase.rpc('increment_content_orders', {
        p_module_id: moduleId,
        p_tenant_id: tenantId,
        p_threshold: order
    })

    const { data: newItem, error } = await supabase
        .from('content_items')
        .insert({
            module_id: moduleId,
            tenant_id: tenantId,
            title,
            url: content_source === 'external' ? url : '',
            type,
            content_source,
            storage_path: content_source === 'storage' ? storage_path : null,
            sort_order: order
        })
        .select('id')
        .single()

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'CONTENT_CREATE',
        entityType: 'content',
        entityId: newItem.id,
        metadata: { title, moduleId, tenantId, sort_order: order }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.content(moduleId))
    return { success: true }
}

export async function updateContent(id: string, moduleId: string, formData: FormData, tenantId: string, tenantSlug: string) {
    const supabase = await createClient()

    const title = (formData.get('title') as string || '').trim()
    const url = (formData.get('url') as string || '').trim()
    const type = formData.get('type')?.toString() || undefined
    const content_source = (formData.get('content_source') as any) || 'external'
    const storage_path = (formData.get('storage_path') as string) || undefined
    const sort_order = formData.get('sort_order')

    const validation = contentSchema.extend({ sort_order: z.coerce.number().int().default(0) }).safeParse({
        title,
        url: url || undefined,
        type,
        content_source,
        storage_path,
        sort_order
    })
    if (!validation.success) {
        return { error: helperZodError(validation.error) }
    }

    const newOrder = (validation.data as any).sort_order || 0

    // Get old order
    const { data: oldItem } = await supabase.from('content_items').select('sort_order').eq('id', id).single()
    const oldOrder = oldItem?.sort_order ?? 0

    if (newOrder !== oldOrder) {
        if (newOrder < oldOrder) {
            await supabase.rpc('reorder_content_up', {
                p_module_id: moduleId,
                p_tenant_id: tenantId,
                p_new_order: newOrder,
                p_old_order: oldOrder
            })
        } else {
            await supabase.rpc('reorder_content_down', {
                p_module_id: moduleId,
                p_tenant_id: tenantId,
                p_new_order: newOrder,
                p_old_order: oldOrder
            })
        }
    }

    const { error } = await supabase
        .from('content_items')
        .update({
            title,
            url: content_source === 'external' ? url : '',
            type,
            content_source,
            storage_path: content_source === 'storage' ? storage_path : null,
            sort_order: newOrder
        })
        .eq('id', id)

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'CONTENT_UPDATE',
        entityType: 'content',
        entityId: id,
        metadata: { title, moduleId, tenantId, sort_order: newOrder }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.content(moduleId))
    return { success: true }
}

export async function deleteContent(id: string, moduleId: string, tenantId: string, tenantSlug: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('content_items').delete().eq('id', id)

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'CONTENT_DELETE',
        entityType: 'content',
        entityId: id,
        metadata: { moduleId, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.content(moduleId))
    return { success: true }
}

function helperZodError(error: z.ZodError) {
    return error.issues.map(e => e.message).join(', ')
}
