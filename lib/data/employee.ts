import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { cache } from 'react'
import { redirect } from 'next/navigation'

export const getMyAssignedCourses = cache(async (tenantId: string) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    console.log('[getMyAssignedCourses] Starting fetch:', { tenantId, userId: user?.id })

    if (!user) {
        console.log('[getMyAssignedCourses] No user found')
        return []
    }

    // Use Admin Client to bypass RLS
    const adminClient = createServiceRoleClient()

    const { data, error } = await adminClient
        .from('employee_course_assignments')
        .select(`
            courses!inner (
                id,
                title,
                status,
                description,
                image_url
            )
        `)
        .eq('employee_id', user.id)
        .eq('tenant_id', tenantId)
        // .eq('courses.status', 'published') <--- Removed this filter
        .order('title', { foreignTable: 'courses' })

    if (error) {
        console.error("[getMyAssignedCourses] Error:", error)
        return []
    }

    console.log(`[getMyAssignedCourses] Raw data:`, JSON.stringify(data, null, 2))
    console.log(`[getMyAssignedCourses] Found ${data?.length || 0} assignments`)

    // Transform flattened response
    const courses = data?.map((item: any) => ({
        id: item.courses.id,
        title: item.courses.title,
        status: item.courses.status,
        description: item.courses.description,
        image_url: item.courses.image_url
    })) || []

    console.log('[getMyAssignedCourses] Transformed courses:', JSON.stringify(courses, null, 2))
    return courses
})

export const getCourseWithModules = cache(async (courseId: string) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // 1. Verify Assignment + Get Tenant ID
    // We must ensure the user actually has this course assigned
    const adminClient = createServiceRoleClient()

    const { data: assignment, error: assignError } = await adminClient
        .from('employee_course_assignments')
        .select('tenant_id')
        .eq('employee_id', user.id)
        .eq('course_id', courseId)
        .single()

    if (assignError || !assignment) {
        console.error('[getCourseWithModules] Assignment check failed:', assignError)
        return null
    }

    // 2. Fetch Course Details (bypassing RLS)
    const { data: course, error: courseError } = await adminClient
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('tenant_id', assignment.tenant_id)
        .single()

    if (courseError || !course) {
        console.error('[getCourseWithModules] Course fetch failed:', courseError)
        return null
    }

    // 3. Fetch Modules with their first content item (for direct navigation)
    const { data: modules } = await adminClient
        .from('modules')
        .select(`
            *,
            content_items (
                id,
                created_at
            )
        `)
        .eq('course_id', courseId)
        .order('sort_order')

    return { course, modules: modules || [] }
})

export const getModuleWithContent = cache(async (moduleId: string) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const adminClient = createServiceRoleClient()

    // 1. Fetch Module + Course Info (bypassing RLS)
    // We need to know the course_id to verify assignment
    const { data: moduleData, error: moduleError } = await adminClient
        .from('modules')
        .select('*, courses(*)')
        .eq('id', moduleId)
        .single()

    if (moduleError || !moduleData) return null

    // 2. Verify Assignment
    // Is the USER assigned to the COURSE that this module belongs to?
    const { data: assignment } = await adminClient
        .from('employee_course_assignments')
        .select('id')
        .eq('employee_id', user.id)
        .eq('course_id', moduleData.course_id)
        .single()

    if (!assignment) {
        console.error('[getModuleWithContent] User not assigned to this course')
        return null
    }

    // 3. Fetch Content
    const { data: content } = await adminClient
        .from('content_items')
        .select('*')
        .eq('module_id', moduleId)
        .order('sort_order', { ascending: true })

    return { module: moduleData, content: content || [] }
})
