import { createClient } from '@/lib/supabase/server' // Use standard client for logging as the user
import { createServiceRoleClient } from '@/lib/supabase/admin' // Use service role if we need to log system events

type AuditAction =
    | 'COURSE_CREATE' | 'COURSE_UPDATE' | 'COURSE_DELETE'
    | 'MODULE_CREATE' | 'MODULE_UPDATE' | 'MODULE_DELETE'
    | 'CONTENT_CREATE' | 'CONTENT_UPDATE' | 'CONTENT_DELETE'
    | 'ASSIGNMENT_UPDATE'
    | 'USER_CREATE' | 'USER_INVITE' | 'USER_UPDATE' | 'USER_DEACTIVATE' | 'USER_RESET_PASSWORD'
    | 'SEND_MAGIC_LINK' | 'SEND_PASSWORD_RESET' | 'REMOVE_FROM_TENANT'
    | 'IMPORT_BULK'
    | 'COHORT_CREATE' | 'COHORT_MEMBER_ADD' | 'COHORT_ASSIGNMENT_CREATE'

interface LogEntry {
    tenantId?: string
    action: AuditAction
    entityType: 'course' | 'module' | 'content' | 'user' | 'profile' | 'assignment' | 'system' | 'cohort' | 'membership'
    entityId?: string
    metadata?: any
}

export async function logAudit({ tenantId, action, entityType, entityId, metadata }: LogEntry) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            console.warn('Audit Log: No authenticated user found for action', action)
            // Fallback: Log as system?
            return
        }

        const tId = tenantId || metadata?.tenantId

        const { error } = await supabase.from('audit_logs').insert({
            tenant_id: tId,
            actor_id: user.id,
            actor_email: user.email,
            action,
            entity_type: entityType,
            entity_id: entityId,
            metadata
        })

        if (error) {
            console.error('Audit Log Error:', error)
        }
    } catch (err) {
        console.error('Audit Log Exception:', err)
    }
}
