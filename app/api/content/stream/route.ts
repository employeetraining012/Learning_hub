import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const contentItemId = searchParams.get('contentItemId')

    if (!contentItemId) {
        return NextResponse.json({ error: 'Missing contentItemId' }, { status: 400 })
    }

    try {
        // 1. Authenticate user
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Get content item details
        const adminClient = createServiceRoleClient()
        const { data: contentItem, error: contentError } = await adminClient
            .from('content_items')
            .select('*, modules(course_id, tenant_id)')
            .eq('id', contentItemId)
            .single()

        if (contentError || !contentItem) {
            return NextResponse.json({ error: 'Content not found' }, { status: 404 })
        }

        const moduleData = contentItem.modules as any
        const courseId = moduleData?.course_id
        const tenantId = moduleData?.tenant_id

        // 3. Verify user is assigned to this course
        const { data: assignment } = await adminClient
            .from('employee_course_assignments')
            .select('id')
            .eq('employee_id', user.id)
            .eq('course_id', courseId)
            .single()

        if (!assignment) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        // 4. Log access for audit
        await adminClient.from('audit_logs').insert({
            tenant_id: tenantId,
            user_id: user.id,
            action: 'CONTENT_VIEW',
            entity_type: 'content',
            entity_id: contentItemId,
            metadata: {
                title: contentItem.title,
                type: contentItem.type,
                timestamp: new Date().toISOString()
            }
        })

        // 5. Handle based on content source
        if (contentItem.content_source === 'storage' && contentItem.storage_path) {
            // Fetch from Supabase Storage
            const { data: fileData, error: storageError } = await adminClient
                .storage
                .from('content')
                .download(contentItem.storage_path)

            if (storageError || !fileData) {
                return NextResponse.json({ error: 'File not found in storage' }, { status: 404 })
            }

            // Stream the file
            const arrayBuffer = await fileData.arrayBuffer()
            const headers = new Headers()
            headers.set('Content-Type', fileData.type || 'application/pdf')
            headers.set('Content-Disposition', 'inline')
            headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')

            return new NextResponse(arrayBuffer, { status: 200, headers })
        } else if (contentItem.url) {
            // Check if it's a Google Drive URL and convert to download link if possible
            let fetchUrl = contentItem.url
            if (contentItem.url.includes('drive.google.com')) {
                const match = contentItem.url.match(/\/file\/d\/([^/]+)/)
                if (match && match[1]) {
                    fetchUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`
                }
            }

            // For external URLs, proxy the request
            const response = await fetch(fetchUrl)
            if (!response.ok) {
                // If Google Drive download fails (e.g. large file warning or protected), fallback may be needed
                // But for now we try to proxy.
                return NextResponse.json({ error: 'Failed to fetch content from source' }, { status: 502 })
            }

            const arrayBuffer = await response.arrayBuffer()
            const contentType = response.headers.get('content-type') || 'application/octet-stream'

            const headers = new Headers()
            headers.set('Content-Type', contentType)
            headers.set('Content-Disposition', 'inline')
            headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')

            // If it was a Google Drive PDF, ensure type is PDF
            if (fetchUrl.includes('drive.google.com') && !contentType.includes('pdf')) {
                headers.set('Content-Type', 'application/pdf')
            }

            return new NextResponse(arrayBuffer, { status: 200, headers })
        }

        return NextResponse.json({ error: 'No content source available' }, { status: 400 })

    } catch (error) {
        console.error('Stream API Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
