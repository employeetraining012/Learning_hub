'use client'

import React from 'react'
import { ContentNode } from '@/lib/learn/course-tree'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Player({ item }: { item: ContentNode }) {
    if (!item.url) {
        return <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">No URL provided</div>
    }

    const isYouTube = item.type === 'youtube' || item.url.includes('youtube.com') || item.url.includes('youtu.be')
    const isGoogleDrive = item.url.includes('drive.google.com')
    const isPdf = item.type === 'pdf' || item.url.toLowerCase().endsWith('.pdf') || isGoogleDrive
    const isPpt = item.type === 'ppt' || item.url.toLowerCase().endsWith('.ppt') || item.url.toLowerCase().endsWith('.pptx')
    const isImage = item.type === 'image'
    
    // Helper to get embed URL (reused from previous viewer logic but cleaner)
    const getEmbedUrl = (rawUrl: string) => {
        if (isYouTube) {
            let videoId = ''
            if (rawUrl.includes('youtu.be/')) videoId = rawUrl.split('youtu.be/')[1].split('?')[0]
            else if (rawUrl.includes('v=')) videoId = rawUrl.split('v=')[1].split('&')[0]
            else if (rawUrl.includes('embed/')) videoId = rawUrl.split('embed/')[1].split('?')[0]
            return `https://www.youtube.com/embed/${videoId}`
        }
        // Google Drive: Convert sharing link to preview/embed link
        if (isGoogleDrive) {
            // Pattern: https://drive.google.com/file/d/FILE_ID/view?...
            const match = rawUrl.match(/\/file\/d\/([^/]+)/)
            if (match && match[1]) {
                return `https://drive.google.com/file/d/${match[1]}/preview`
            }
            // Fallback for other Google Drive formats
            return rawUrl.replace('/view', '/preview').replace('/edit', '/preview')
        }
        if (isPpt) {
            return `https://docs.google.com/gview?url=${encodeURIComponent(rawUrl)}&embedded=true`
        }
        return rawUrl
    }

    const embedUrl = getEmbedUrl(item.url)

    if (isYouTube) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center">
               <div className="w-full aspect-video md:aspect-auto md:h-full">
                    <iframe 
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
               </div>
            </div>
        )
    }

    if (isPdf || isPpt) {
        return (
            <div className="w-full h-full bg-gray-100">
                <iframe src={embedUrl} className="w-full h-full" />
            </div>
        )
    }

    if (isImage) {
        return (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center p-4">
                <img src={item.url} alt={item.title} className="max-w-full max-h-full object-contain" />
            </div>
        )
    }

    // Default / Link fallback
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-500 mb-6 max-w-md">This content is hosted externally. You can view it by clicking the button below.</p>
            <Button asChild size="lg">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    Open in New Tab <ExternalLink className="w-4 h-4" />
                </a>
            </Button>
        </div>
    )
}
