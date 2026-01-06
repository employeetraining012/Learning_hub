import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ contentId: string }> }
) {
    const { contentId } = await params
    const supabase = await createClient()

    // 1. Check Auth (RLS will handle data access, but we need a user to start)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    // 2. Fetch Content Item
    const { data: content, error: dbError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', contentId)
        .single()

    if (dbError || !content) {
        return new NextResponse('Content not found', { status: 404 })
    }

    // 3. Handle Storage Files
    if (content.content_source === 'storage' && content.storage_path) {
        // Get a signed URL for internal fetching
        const { data: signedData, error: signError } = await supabase
            .storage
            .from('learning-content')
            .createSignedUrl(content.storage_path, 60) // 60 seconds validity

        if (signError || !signedData?.signedUrl) {
            return new NextResponse('Error generating secure link', { status: 500 })
        }

        // Fetch the file from Supabase Storage
        const fileResponse = await fetch(signedData.signedUrl)

        if (!fileResponse.ok) {
            return new NextResponse('Error fetching file source', { status: fileResponse.status })
        }

        // Stream the response back to the client
        // Pass relevant headers (Content-Type, Content-Length)
        const headers = new Headers()
        headers.set('Content-Type', fileResponse.headers.get('Content-Type') || 'application/octet-stream')
        headers.set('Content-Length', fileResponse.headers.get('Content-Length') || '')
        headers.set('Cache-Control', 'private, max-age=3600') // Cache for 1 hour locally

        return new NextResponse(fileResponse.body, {
            status: 200,
            headers,
        })
    }

    // 4. Handle External Links (e.g., Vimeo/YouTube)
    // We cannot easily proxy the stream for YouTube/Vimeo iframes without breaking them.
    // However, we can return the embed URL as text if helpful, but sticking to 
    // redirect for "external" might be best if this endpoint is used generic.
    // OR we return 400 Bad Request because current Player handles external directly.
    return new NextResponse('This content type is not proxied', { status: 400 })
}
