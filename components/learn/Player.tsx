'use client'

import React from 'react'
import { ContentNode } from '@/lib/learn/course-tree'
import dynamic from 'next/dynamic'

// Dynamically import SecurePDFViewer to avoid SSR issues with react-pdf
const SecurePDFViewer = dynamic(
    () => import('./SecurePDFViewer').then(mod => mod.SecurePDFViewer),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-white">Loading Viewer...</div>
            </div>
        )
    }
)

// Dynamically import SecureVimeoPlayer for secure Vimeo embedding
const SecureVimeoPlayer = dynamic(
    () => import('./SecureVimeoPlayer').then(mod => mod.SecureVimeoPlayer),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="text-white">Loading Player...</div>
            </div>
        )
    }
)

const YouTubeEmbed = dynamic(() => import('./YouTubeEmbed').then(mod => mod.YouTubeEmbed), { ssr: false })

interface PlayerProps {
    item: ContentNode
}

export function Player({ item }: PlayerProps) {
    if (!item.url) {
        return <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">No URL provided</div>
    }

    const isYouTube = item.type === 'youtube' || item.url.includes('youtube.com') || item.url.includes('youtu.be')
    const isGoogleDrive = item.url.includes('drive.google.com')
    const isGoogleSlides = item.url.includes('docs.google.com/presentation')

    // Determine content types
    // We treating Google Drive Files (that are not Slides) as PDFs/Images that should use SecureViewer if possible
    const isVideo = item.type === 'video' || item.url.endsWith('.mp4')
    const isPdf = item.type === 'pdf' || item.url.toLowerCase().endsWith('.pdf') || (isGoogleDrive && !isGoogleSlides && !isVideo)

    // For now, if it's a PPT we might normally use Google Viewer, but if it's Google Drive based, we try SecureViewer
    // If it's pure PPT file link, we use Google Viewer iframe
    const isPpt = item.type === 'ppt' || item.url.toLowerCase().endsWith('.ppt') || item.url.toLowerCase().endsWith('.pptx') || isGoogleSlides
    const isImage = item.type === 'image'
    const isVimeo = item.type === 'vimeo' || item.url.includes('vimeo.com')

    // Helper to get embed URL for YouTube/Slides
    const getEmbedUrl = (rawUrl: string) => {
        if (isYouTube) {
            let videoId = ''
            if (rawUrl.includes('youtu.be/')) videoId = rawUrl.split('youtu.be/')[1].split('?')[0]
            else if (rawUrl.includes('v=')) videoId = rawUrl.split('v=')[1].split('&')[0]
            else if (rawUrl.includes('embed/')) videoId = rawUrl.split('embed/')[1].split('?')[0]
            return `https://www.youtube.com/embed/${videoId}`
        }
        if (isVimeo) {
            // Extract Vimeo ID
            // Supported formats: vimeo.com/123456, player.vimeo.com/video/123456
            const match = rawUrl.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/)
            if (match && match[1]) {
                // title=0: Hide title
                // byline=0: Hide author
                // portrait=0: Hide author image
                // badge=0: Hide badge
                // dnt=1: Do Not Track (privacy)
                // autopause=0: Don't pause when other media plays
                // player_id: helping with API control if needed
                return `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0&badge=0&dnt=1&autopause=0&player_id=0&app_id=58479`
            }
            return rawUrl
        }
        if (isGoogleSlides) {
            const match = rawUrl.match(/\/presentation\/d\/([^/]+)/)
            if (match && match[1]) {
                return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`
            }
            return rawUrl.replace('/edit', '/embed').replace('/view', '/embed')
        }
        // External PPT files (not Google) - use Google Docs viewer
        if (isPpt && !isGoogleSlides) {
            return `https://docs.google.com/gview?url=${encodeURIComponent(rawUrl)}&embedded=true`
        }
        return rawUrl
    }

    const embedUrl = getEmbedUrl(item.url)

    // YouTube: Keep iframe (acceptable)
    if (isYouTube) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center">
                <div className="w-full aspect-video md:aspect-auto md:h-full">
                    <YouTubeEmbed url={item.url} />
                </div>
            </div>
        )
    }

    if (isVimeo) {
        // Extract Vimeo video ID for secure player
        const match = item.url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/)
        const vimeoId = match ? match[1] : ''

        if (!vimeoId) {
            return <div className="w-full h-full flex items-center justify-center bg-black text-white">Invalid Vimeo URL</div>
        }

        return (
            <div className="w-full h-full">
                <SecureVimeoPlayer videoId={vimeoId} />
            </div>
        )
    }

    if (isVideo) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center">
                <video
                    src={embedUrl}
                    controls
                    className="max-w-full max-h-full"
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                />
            </div>
        )
    }

    // PDF & Google Drive Files: Use SecurePDFViewer (canvas-based)
    // This removes the iframe and pop-out button by proxying the file content
    if (isPdf) {
        // We use the proxy route for ALL pseudo-PDFs to ensure we get bytes for canvas
        // The proxy will handle Google Drive ID extraction
        const proxyUrl = `/api/content/stream?contentItemId=${item.id}`

        return (
            <div className="w-full h-full">
                <SecurePDFViewer url={proxyUrl} />
            </div>
        )
    }

    // PPT/Slides: Keep iframe
    if (isPpt) {
        return (
            <div className="w-full h-full bg-gray-100 relative">
                <iframe src={embedUrl} className="w-full h-full border-0" />
            </div>
        )
    }

    // Image
    if (isImage) {
        return (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center p-4 relative">
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
