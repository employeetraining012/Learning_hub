'use client'

import { SecureYouTubePlayer } from '@/components/learn/SecureYouTubePlayer'

interface YouTubeEmbedProps {
    url: string
}

export function YouTubeEmbed({ url }: YouTubeEmbedProps) {
    // Extract YouTube video ID
    let videoId = ''
    if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0]
    } else if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0]
    } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1].split('?')[0]
    }

    if (!videoId) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black text-white">
                Invalid YouTube URL
            </div>
        )
    }

    // Default mock user email - in real usage, this should come from context/props if available
    const userEmail = "User"

    return <SecureYouTubePlayer videoId={videoId} userEmail={userEmail} />
}
