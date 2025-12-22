import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { cache } from 'react'

export type ContentNode = {
    id: string
    title: string
    type: 'video' | 'youtube' | 'pdf' | 'link' | 'text' | 'image' | 'ppt'
    content_source: 'upload' | 'embed' | 'url'
    url?: string
    description?: string
    duration?: number
    is_completed?: boolean // Future use
}

export type ModuleNode = {
    id: string
    title: string
    sort_order: number
    items: ContentNode[]
}

export type CourseTree = {
    course: {
        id: string
        title: string
        description?: string
        tenant_id: string
    }
    modules: ModuleNode[]
}

export const fetchCourseTree = cache(async (courseId: string, userId: string): Promise<CourseTree | null> => {
    // Use Service Role Client to ensure comprehensive data access
    const adminClient = createServiceRoleClient()

    // 1. Verify Assignment & Fetch Course
    // Ensures user actually has access to this course
    const { data: assignment } = await adminClient
        .from('employee_course_assignments')
        .select('tenant_id')
        .eq('employee_id', userId)
        .eq('course_id', courseId)
        .single()

    if (!assignment) {
        console.error('[fetchCourseTree] User not assigned to course')
        return null
    }

    const { data: course } = await adminClient
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

    if (!course) return null

    // 2. Fetch Modules
    const { data: modules } = await adminClient
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order')

    if (!modules) return { course, modules: [] }

    // 3. Fetch Content Items for all modules
    // Using a single query with 'in' filter is efficient
    const moduleIds = modules.map(m => m.id)
    const { data: contentItems } = await adminClient
        .from('content_items')
        .select('*')
        .in('module_id', moduleIds)
    // .order('sort_order') // Add sort_order col to DB later if needed, currently created_at implies order or undefined

    // 4. Assemble Tree
    const treeModules = modules.map(m => {
        const items = contentItems
            ?.filter(c => c.module_id === m.id)
            // Sort by creation time as fallback for sort_order
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map(c => ({
                id: c.id,
                title: c.title,
                type: c.type,
                content_source: c.content_source,
                url: c.url,
                description: c.description,
                duration: 0 // Placeholder
            })) || []

        return {
            id: m.id,
            title: m.title,
            sort_order: m.sort_order,
            items
        }
    })

    return {
        course: {
            id: course.id,
            title: course.title,
            description: course.description,
            tenant_id: course.tenant_id
        },
        modules: treeModules
    }
})
