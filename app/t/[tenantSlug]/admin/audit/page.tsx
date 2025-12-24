import { createClient } from '@/lib/supabase/server'
import { AuditLogsClient } from '@/components/admin/AuditLogsClient'

// Simple type for display
type AuditLog = {
    id: string
    action: string
    entity_type: string
    entity_id: string
    actor_email: string
    created_at: string
    metadata: any
}

export default async function AuditPage() {
    const supabase = await createClient()
    
    // Fetch all logs (increased limit for pagination)
    const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

    return (
        <div className="p-8 space-y-6">
            <div>
                 <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                 <p className="text-muted-foreground mt-2">View system activity and changes.</p>
            </div>
            
            <AuditLogsClient logs={(logs as AuditLog[]) || []} />
        </div>
    )
}
