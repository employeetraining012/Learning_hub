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

    const order = validation.data.sort_order

    // Rebalance: Shift existing modules >= new order
    const { error: rpcError } = await supabase.rpc('increment_module_orders', {
        p_course_id: courseId,
        p_tenant_id: tenantId,
        p_threshold: order
    })

    if (rpcError) {
        console.error('RPC Error (Module Create Rebalance):', rpcError)
    }

    const { data: newModule, error } = await supabase
        .from('modules')
        .insert({
            course_id: courseId,
            tenant_id: tenantId,
            title,
            description,
            sort_order: order
        })
        .select('id')
        .single()

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'MODULE_CREATE',
        entityType: 'module',
        entityId: newModule.id,
        metadata: { title, courseId, tenantId, sort_order: order }
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

    const newOrder = validation.data.sort_order

    // Get old order
    const { data: oldModule } = await supabase.from('modules').select('sort_order').eq('id', id).single()
    const oldOrder = oldModule?.sort_order ?? 0

    if (newOrder !== oldOrder) {
        // Rebalance based on direction
        if (newOrder < oldOrder) {
            // New position is higher up (smaller number)
            // Shift modules between [newOrder, oldOrder-1] down
            const { error: upErr } = await supabase.rpc('reorder_modules_up', {
                p_course_id: courseId,
                p_tenant_id: tenantId,
                p_new_order: newOrder,
                p_old_order: oldOrder
            })
            if (upErr) console.error('RPC Error (reorder_modules_up):', upErr)
        } else {
            // New position is lower down (larger number)
            // Shift modules between [oldOrder+1, newOrder] up
            const { error: downErr } = await supabase.rpc('reorder_modules_down', {
                p_course_id: courseId,
                p_tenant_id: tenantId,
                p_new_order: newOrder,
                p_old_order: oldOrder
            })
            if (downErr) console.error('RPC Error (reorder_modules_down):', downErr)
        }
    }

    const { error } = await supabase
        .from('modules')
        .update({
            title,
            description,
            sort_order: newOrder
        })
        .eq('id', id)

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'MODULE_UPDATE',
        entityType: 'module',
        entityId: id,
        metadata: { title, courseId, tenantId, sort_order: newOrder }
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
