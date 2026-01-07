
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const driveId = searchParams.get('driveId')
    const url = searchParams.get('url')

    let targetUrl = ''

    if (driveId) {
        targetUrl = `https://docs.google.com/uc?export=view&id=${driveId}`
    } else if (url) {
        targetUrl = url
    } else {
        return new NextResponse('Missing driveId or url', { status: 400 })
    }

    try {
        const response = await fetch(targetUrl)

        if (!response.ok) {
            return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status })
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream'
        const buffer = await response.arrayBuffer()

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        console.error('Image proxy error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
