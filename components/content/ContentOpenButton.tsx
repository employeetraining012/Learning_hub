import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { PlayCircle, Eye, ExternalLink, Loader2 } from "lucide-react"

export function ContentOpenButton({ 
    contentItemId, 
    externalUrl, 
    source,
    title,
    type
}: { 
    contentItemId: string, 
    externalUrl?: string | null, 
    source: string,
    title?: string,
    type?: string
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [activeUrl, setActiveUrl] = useState<string | null>(null)

    const isYouTube = type === 'youtube' || (externalUrl?.includes('youtube.com') || externalUrl?.includes('youtu.be'))
    const isPdf = type === 'pdf' || externalUrl?.toLowerCase().endsWith('.pdf')
    const isPpt = type === 'ppt' || externalUrl?.toLowerCase().endsWith('.ppt') || externalUrl?.toLowerCase().endsWith('.pptx')
    const isImage = type === 'image' || (externalUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(externalUrl))
    const isVideo = type === 'video' || (externalUrl && /\.(mp4|webm|ogg)$/i.test(externalUrl))

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

    const handleOpen = async () => {
        if (source === 'external' && externalUrl) {
            setActiveUrl(getEmbedUrl(externalUrl))
            setOpen(true)
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/content/signed-url?contentItemId=${contentItemId}`)
            const data = await res.json()
            if (data.url) {
                setActiveUrl(data.url)
                setOpen(true)
            } else {
                toast.error(data.error || 'Failed to open file')
            }
        } catch (err) {
            toast.error('Connection error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); handleOpen(); }} disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : (isYouTube ? <PlayCircle className="w-3 h-3" /> : <Eye className="w-3 h-3" />)}
                    View
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-4 border-b bg-white">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="truncate pr-8">{title || 'Content Viewer'}</DialogTitle>
                    </div>
                </DialogHeader>
                
                <div className="flex-1 bg-gray-50 relative overflow-auto flex items-center justify-center">
                    {activeUrl ? (
                         isYouTube ? (
                            <iframe 
                                src={activeUrl}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : isPdf || isPpt ? (
                            <iframe 
                                src={activeUrl}
                                className="w-full h-full border-0"
                            />
                        ) : isImage ? (
                            <img 
                                src={activeUrl} 
                                alt={title} 
                                className="max-w-full max-h-full object-contain shadow-sm"
                            />
                        ) : isVideo ? (
                            <video 
                                src={activeUrl} 
                                controls 
                                autoPlay
                                className="max-w-full max-h-full"
                            />
                        ) : (
                            <iframe 
                                src={activeUrl} 
                                className="w-full h-full border-0"
                            />
                        )
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading content...</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
