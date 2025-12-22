import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/config/routes'

export default async function ContentViewerPage({ params }: { params: Promise<{ tenantSlug: string, contentId: string }> }) {
    const { tenantSlug, contentId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(ROUTES.login)
    }

    // Use Admin Client to bypass RLS
    const adminClient = createServiceRoleClient()

    // 1. Fetch content item with module and course info
    const { data: contentItem, error } = await adminClient
        .from('content_items')
        .select(`
            *,
            modules (
                id,
                title,
                course_id,
                courses (
                    id,
                    title,
                    tenant_id
                )
            )
        `)
        .eq('id', contentId)
        .single()

    if (error || !contentItem) {
        console.error('[ContentViewer] Content fetch failed:', error)
        notFound()
    }

    const module = (contentItem as any).modules
    const course = module?.courses

    // 2. Security Check: Verify User has Assignment
    const { data: assignment } = await adminClient
        .from('employee_course_assignments')
        .select('id')
        .eq('employee_id', user.id)
        .eq('course_id', module.course_id)
        .eq('tenant_id', course.tenant_id)
        .single()

    if (!assignment) {
        console.error('[ContentViewer] User not assigned to this content')
        notFound() // Or redirect to unauthorized page
    }

    const isYouTube = contentItem.type === 'youtube' || contentItem.url?.includes('youtube.com') || contentItem.url?.includes('youtu.be')
    const isPdf = contentItem.type === 'pdf' || contentItem.url?.toLowerCase().endsWith('.pdf')
    const isPpt = contentItem.type === 'ppt' || contentItem.url?.toLowerCase().endsWith('.ppt') || contentItem.url?.toLowerCase().endsWith('.pptx')
    const isImage = contentItem.type === 'image'
    const isVideo = contentItem.type === 'video'

    const getEmbedUrl = (rawUrl: string) => {
        if (isYouTube) {
            let videoId = ''
            if (rawUrl.includes('youtu.be/')) {
                videoId = rawUrl.split('youtu.be/')[1].split('?')[0]
            } else if (rawUrl.includes('v=')) {
                videoId = rawUrl.split('v=')[1].split('&')[0]
            } else if (rawUrl.includes('embed/')) {
                videoId = rawUrl.split('embed/')[1].split('?')[0]
            }
            return `https://www.youtube.com/embed/${videoId}`
        }
        if (isPpt) {
            return `https://docs.google.com/gview?url=${encodeURIComponent(rawUrl)}&embedded=true`
        }
        return rawUrl
    }

    const embedUrl = contentItem.url ? getEmbedUrl(contentItem.url) : null

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-950 border-b border-gray-800">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild className="text-gray-300 hover:text-white">
                            <Link href={ROUTES.tenant(tenantSlug).employee.module(module?.id || '')}>
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back to Module
                            </Link>
                        </Button>
                        <div className="h-6 w-px bg-gray-700" />
                        <div>
                            <h1 className="font-semibold text-sm truncate max-w-md">{contentItem.title}</h1>
                            <p className="text-xs text-gray-400 truncate max-w-md">
                                {course?.title} • {module?.title}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-black rounded-lg overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
                    {embedUrl ? (
                        isYouTube ? (
                            <iframe 
                                src={embedUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        ) : isPdf || isPpt ? (
                            <iframe 
                                src={embedUrl}
                                className="w-full h-full"
                            />
                        ) : isImage ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-950">
                                <img 
                                    src={contentItem.url || ''} 
                                    alt={contentItem.title} 
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        ) : isVideo ? (
                            <video 
                                src={contentItem.url || ''} 
                                controls 
                                autoPlay
                                className="w-full h-full"
                            />
                        ) : (
                            <iframe 
                                src={embedUrl} 
                                className="w-full h-full"
                            />
                        )
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-gray-500">No content available</p>
                        </div>
                    )}
                </div>

                {/* Content Description */}
                <div className="mt-8 bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-2">{contentItem.title}</h2>
                    <div className="flex gap-2 text-sm text-gray-400">
                        <span className="px-2 py-1 bg-gray-700 rounded">{contentItem.type.toUpperCase()}</span>
                        <span className="px-2 py-1 bg-gray-700 rounded">{contentItem.content_source.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
