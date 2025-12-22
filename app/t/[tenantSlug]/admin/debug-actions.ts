'use server'

import { createServiceRoleClient } from '@/lib/supabase/admin'

export async function diagnoseAssignments(employeeName: string, tenantSlug: string) {
    const adminClient = createServiceRoleClient()

    console.log('\n========== ASSIGNMENT DIAGNOSIS ==========')
    console.log('Employee:', employeeName)
    console.log('Tenant:', tenantSlug)

    // 1. Get tenant info
    const { data: tenant } = await adminClient
        .from('tenants')
        .select('id, slug')
        .eq('slug', tenantSlug)
        .single()

    console.log('\n1. TENANT INFO:')
    console.log(JSON.stringify(tenant, null, 2))

    // 2. Get employee info
    const { data: employee } = await adminClient
        .from('profiles')
        .select('id, full_name, email')
        .ilike('full_name', `%${employeeName}%`)
        .single()

    console.log('\n2. EMPLOYEE INFO:')
    console.log(JSON.stringify(employee, null, 2))

    if (!employee || !tenant) {
        console.log('ERROR: Employee or tenant not found')
        return { error: 'Not found' }
    }

    // 3. Check course statuses
    const { data: courses } = await adminClient
        .from('courses')
        .select('id, title, status, tenant_id')
        .eq('tenant_id', tenant.id)

    console.log('\n3. ALL COURSES IN TENANT:')
    courses?.forEach(c => {
        console.log(`  - ${c.title}: status="${c.status}"`)
    })

    // 4. Check assignments for this employee
    const { data: assignments } = await adminClient
        .from('employee_course_assignments')
        .select(`
            *,
            courses (id, title, status),
            tenants (slug)
        `)
        .eq('employee_id', employee.id)

    console.log('\n4. ASSIGNMENTS FOR THIS EMPLOYEE:')
    console.log(JSON.stringify(assignments, null, 2))

    // 5. Check what query would return with published filter
    const { data: publishedAssignments } = await adminClient
        .from('employee_course_assignments')
        .select(`
            courses!inner (id, title, status)
        `)
        .eq('employee_id', employee.id)
        .eq('tenant_id', tenant.id)
        .eq('courses.status', 'published')

    console.log('\n5. PUBLISHED COURSES ONLY:')
    console.log(JSON.stringify(publishedAssignments, null, 2))

    console.log('\n========== DIAGNOSIS COMPLETE ==========\n')

    return {
        tenant,
        employee,
        totalCourses: courses?.length || 0,
        totalAssignments: assignments?.length || 0,
        publishedAssignments: publishedAssignments?.length || 0,
        courses,
        assignments
    }
}
