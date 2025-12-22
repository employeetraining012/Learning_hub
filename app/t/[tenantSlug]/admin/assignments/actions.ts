'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/admin/audit'
import { ROUTES } from '@/lib/config/routes'

export async function getEmployeeAssignments(employeeId: string, tenantId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('employee_course_assignments')
        .select('course_id')
        .eq('employee_id', employeeId)
        .eq('tenant_id', tenantId)

    return data?.map(d => d.course_id) || []
}

export async function saveAssignments(employeeId: string, courseIds: string[], tenantId: string, tenantSlug: string) {
    console.log('[saveAssignments] Starting:', { employeeId, courseIds, tenantId })

    const supabase = await createClient()

    // 1. Get current assignments
    const { data: current, error: fetchError } = await supabase
        .from('employee_course_assignments')
        .select('course_id')
        .eq('employee_id', employeeId)
        .eq('tenant_id', tenantId)

    if (fetchError) {
        console.error('[saveAssignments] Fetch error:', fetchError)
        return { error: fetchError.message }
    }

    const currentIds = new Set(current?.map(c => c.course_id) || [])
    const newIds = new Set(courseIds)

    const toAdd = courseIds.filter(id => !currentIds.has(id))
    const toRemove = Array.from(currentIds).filter(id => !newIds.has(id))

    console.log('[saveAssignments] Changes:', { toAdd, toRemove })

    // Remove assignments
    if (toRemove.length > 0) {
        const { error } = await supabase
            .from('employee_course_assignments')
            .delete()
            .eq('employee_id', employeeId)
            .eq('tenant_id', tenantId)
            .in('course_id', toRemove)

        if (error) {
            console.error('[saveAssignments] Remove error:', error)
            return { error: error.message }
        }
    }

    // Add assignments
    if (toAdd.length > 0) {
        const insertData = toAdd.map(course_id => ({
            employee_id: employeeId,
            tenant_id: tenantId,
            course_id
        }))

        console.log('[saveAssignments] Inserting:', insertData)

        const { data: inserted, error } = await supabase
            .from('employee_course_assignments')
            .insert(insertData)
            .select()

        if (error) {
            console.error('[saveAssignments] Insert error:', error)
            return { error: error.message }
        }
        console.log('[saveAssignments] Inserted:', inserted)
    }

    if (toAdd.length > 0 || toRemove.length > 0) {
        await logAudit({
            action: 'ASSIGNMENT_UPDATE',
            entityType: 'assignment',
            entityId: employeeId,
            metadata: { added: toAdd, removed: toRemove, tenantId }
        })
    }

    revalidatePath(ROUTES.tenant(tenantSlug).admin.assignments)
    revalidatePath(ROUTES.tenant(tenantSlug).employee.dashboard)

    console.log('[saveAssignments] Complete')
    return { success: true }
}

export async function searchEmployees(query: string, tenantId: string) {
    if (!query || query.length < 1) return []

    const adminClient = createServiceRoleClient()

    // Search profiles by name or email
    const { data: profiles, error } = await adminClient
        .from('profiles')
        .select('*, tenant_memberships!inner(tenant_id)')
        .eq('tenant_memberships.tenant_id', tenantId)
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10)
        .order('full_name')

    if (error) {
        console.error('Error searching employees:', error)
        return []
    }

    return profiles || []
}
