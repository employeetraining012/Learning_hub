// FETCHERS FOR SERVER COMPONENTS
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'

export async function getEmployees(tenantId: string) {
    // Use admin client to bypass RLS and ensure all employees are visible
    const adminClient = createServiceRoleClient()

    const { data, error } = await adminClient
        .from('profiles')
        .select('*, tenant_memberships!inner(tenant_id, role)')
        .eq('tenant_memberships.tenant_id', tenantId)
        .order('full_name')

    if (error) {
        console.error('[getEmployees] Error fetching employees:', error)
        return []
    }

    console.log(`[getEmployees] Found ${data?.length || 0} employees for tenant ${tenantId}`)
    return data || []
}

export async function getCourses(tenantId: string) {
    const supabase = await createServerClient()
    const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('title')
    return data || []
}
