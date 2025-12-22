'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/admin/audit'
import { ROUTES } from '@/lib/config/routes'

export async function createCohort(tenantId: string, tenantSlug: string, name: string, description?: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('cohorts')
        .insert({ tenant_id: tenantId, name, description })
        .select()
        .single()

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'COHORT_CREATE',
        entityType: 'cohort',
        entityId: data.id,
        metadata: { name, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.cohorts)
    return { success: true }
}

export async function addMemberToCohort(tenantId: string, tenantSlug: string, cohortId: string, employeeId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('cohort_members')
        .insert({ tenant_id: tenantId, cohort_id: cohortId, employee_id: employeeId })

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'COHORT_MEMBER_ADD',
        entityType: 'cohort',
        entityId: cohortId,
        metadata: { employeeId, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.cohortDetail(cohortId))
    return { success: true }
}

export async function assignCourseToCohort(tenantId: string, tenantSlug: string, cohortId: string, courseId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('cohort_course_assignments')
        .insert({
            tenant_id: tenantId,
            cohort_id: cohortId,
            course_id: courseId
        })

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'COHORT_ASSIGNMENT_CREATE',
        entityType: 'cohort',
        entityId: cohortId,
        metadata: { courseId, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.cohortDetail(cohortId))
    return { success: true }
}
