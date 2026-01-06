'use client'

import { SecureVimeoPlayer } from '@/components/learn/SecureVimeoPlayer'

interface VimeoEmbedProps {
    url: string
}

export function VimeoEmbed({ url }: VimeoEmbedProps) {
    // Extract Vimeo video ID
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/)
    const vimeoId = match ? match[1] : ''

    if (!vimeoId) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black text-white">
                Invalid Vimeo URL
            </div>
        )
    }

    return <SecureVimeoPlayer videoId={vimeoId} />
}
