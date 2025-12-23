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
    const isGoogleSlides = item.url.includes('docs.google.com/presentation')
    const isGoogleDocs = item.url.includes('docs.google.com/document')
    const isPdf = item.type === 'pdf' || item.url.toLowerCase().endsWith('.pdf') || (isGoogleDrive && !isGoogleSlides)
    const isPpt = item.type === 'ppt' || item.url.toLowerCase().endsWith('.ppt') || item.url.toLowerCase().endsWith('.pptx') || isGoogleSlides
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
        // Google Slides: Convert to embed link
        // Pattern: https://docs.google.com/presentation/d/PRESENTATION_ID/edit or /view
        if (isGoogleSlides) {
            const match = rawUrl.match(/\/presentation\/d\/([^/]+)/)
            if (match && match[1]) {
                return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`
            }
            return rawUrl.replace('/edit', '/embed').replace('/view', '/embed')
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
        // External PPT files (not Google)
        if (isPpt && !isGoogleSlides) {
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
            <p className="text-gray-500 max-w-md">This content is hosted externally and restricted for direct viewing.</p>
        </div>
    )
}
