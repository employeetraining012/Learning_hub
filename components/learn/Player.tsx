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
                <div className="text-white">Loading PDF viewer...</div>
            </div>
        )
    }
)

interface PlayerProps {
    item: ContentNode
    watermark?: {
        name: string
        email: string
    }
}

export function Player({ item, watermark }: PlayerProps) {
    if (!item.url) {
        return <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">No URL provided</div>
    }

    const isYouTube = item.type === 'youtube' || item.url.includes('youtube.com') || item.url.includes('youtu.be')
    const isGoogleDrive = item.url.includes('drive.google.com')
    const isGoogleSlides = item.url.includes('docs.google.com/presentation')
    
    // PDFs: Use SecurePDFViewer (no iframe)
    // Note: Google Drive PDFs still need special handling
    const isPdf = item.type === 'pdf' || item.url.toLowerCase().endsWith('.pdf')
    const isGoogleDrivePdf = isGoogleDrive && !isGoogleSlides
    
    const isPpt = item.type === 'ppt' || item.url.toLowerCase().endsWith('.ppt') || item.url.toLowerCase().endsWith('.pptx') || isGoogleSlides
    const isImage = item.type === 'image'
    
    // Helper to get embed URL for YouTube/Slides
    const getEmbedUrl = (rawUrl: string) => {
        if (isYouTube) {
            let videoId = ''
            if (rawUrl.includes('youtu.be/')) videoId = rawUrl.split('youtu.be/')[1].split('?')[0]
            else if (rawUrl.includes('v=')) videoId = rawUrl.split('v=')[1].split('&')[0]
            else if (rawUrl.includes('embed/')) videoId = rawUrl.split('embed/')[1].split('?')[0]
            return `https://www.youtube.com/embed/${videoId}`
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

    // YouTube: Keep iframe (acceptable, no URL leak)
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

    // PDF: Use SecurePDFViewer (canvas-based, no browser controls)
    if (isPdf && !isGoogleDrivePdf) {
        // For direct PDF URLs, use the secure viewer
        // The URL could be proxied through /api/content/stream for extra security
        return (
            <div className="w-full h-full">
                <SecurePDFViewer url={item.url} watermark={watermark} />
            </div>
        )
    }

    // Google Drive PDF: Still needs iframe due to Google's restrictions
    // But we can proxy through our API for non-Google sources
    if (isGoogleDrivePdf) {
        const match = item.url.match(/\/file\/d\/([^/]+)/)
        const previewUrl = match && match[1] 
            ? `https://drive.google.com/file/d/${match[1]}/preview`
            : item.url.replace('/view', '/preview')
        
        return (
            <div className="w-full h-full bg-gray-100 relative">
                <iframe src={previewUrl} className="w-full h-full border-0" />
                {/* Watermark overlay for Google Drive content */}
                {watermark && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="text-black/5 text-lg font-bold rotate-[-30deg] whitespace-nowrap select-none"
                             style={{ fontSize: '1.5rem', letterSpacing: '0.3em' }}>
                            {watermark.name} • {watermark.email}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // PPT/Slides: Keep iframe (Google Slides has limited API)
    if (isPpt) {
        return (
            <div className="w-full h-full bg-gray-100 relative">
                <iframe src={embedUrl} className="w-full h-full border-0" />
                {watermark && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="text-black/5 text-lg font-bold rotate-[-30deg] whitespace-nowrap select-none"
                             style={{ fontSize: '1.5rem', letterSpacing: '0.3em' }}>
                            {watermark.name} • {watermark.email}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Image
    if (isImage) {
        return (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center p-4 relative">
                <img src={item.url} alt={item.title} className="max-w-full max-h-full object-contain" />
                {watermark && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="text-white/10 text-lg font-bold rotate-[-30deg] whitespace-nowrap select-none"
                             style={{ fontSize: '1.5rem', letterSpacing: '0.3em' }}>
                            {watermark.name} • {watermark.email}
                        </div>
                    </div>
                )}
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
