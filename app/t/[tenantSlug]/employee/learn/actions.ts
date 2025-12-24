'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function toggleContentProgress(
    contentItemId: string,
    completed: boolean,
    tenantId: string,
    courseId: string,
    moduleId: string,
    tenantSlug: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const adminClient = createServiceRoleClient()

    // Upsert progress entry
    const { error } = await adminClient
        .from('content_progress')
        .upsert({
            employee_id: user.id,
            content_item_id: contentItemId,
            tenant_id: tenantId,
            completed,
            completed_at: completed ? new Date().toISOString() : null
        }, {
            onConflict: 'employee_id,content_item_id'
        })

    if (error) {
        console.error('[toggleContentProgress] Error:', error)
        return { error: error.message }
    }

    // Revalidate the learn page
    revalidatePath(`/t/${tenantSlug}/employee/learn/${courseId}/${moduleId}/${contentItemId}`)
    revalidatePath(`/t/${tenantSlug}/employee`)

    return { success: true }
}

export async function getContentProgress(courseId: string, tenantId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return {}

    const adminClient = createServiceRoleClient()

    // Get all content item IDs for this course
    const { data: modules } = await adminClient
        .from('modules')
        .select('id')
        .eq('course_id', courseId)

    if (!modules || modules.length === 0) return {}

    const moduleIds = modules.map(m => m.id)

    // Get all content items for these modules
    const { data: contentItems } = await adminClient
        .from('content_items')
        .select('id')
        .in('module_id', moduleIds)

    if (!contentItems || contentItems.length === 0) return {}

    const contentItemIds = contentItems.map(c => c.id)

    // Get progress for these content items
    const { data: progress } = await adminClient
        .from('content_progress')
        .select('content_item_id, completed')
        .eq('employee_id', user.id)
        .in('content_item_id', contentItemIds)

    // Transform to record
    const progressMap: Record<string, boolean> = {}
    progress?.forEach(p => {
        progressMap[p.content_item_id] = p.completed
    })

    return progressMap
}
