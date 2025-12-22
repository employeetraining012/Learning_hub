'use client'

import { ContentItem } from '@/types/db'
import { FileText, Link as LinkIcon, Video, Presentation, FileVideo, ImageIcon, PlayCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import { useParams } from 'next/navigation'

const TYPE_ICONS = {
    youtube: Video,
    pdf: FileText,
    ppt: Presentation,
    link: LinkIcon,
    image: ImageIcon,
    video: FileVideo,
}

export function ContentItemList({ items, courseId }: { items: ContentItem[], courseId: string }) {
    const params = useParams()
    const tenantSlug = params.tenantSlug as string

    if (items.length === 0) {
        return <div className="text-muted-foreground italic">No content items available.</div>
    }

    return (
        <div className="space-y-4">
            {items.map((item) => {
                 const rawItem = item as any
                 const Icon = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] || LinkIcon
                 
                 return (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-md">
                                <Icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">{item.title}</h4>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-[10px] text-muted-foreground uppercase bg-gray-50 px-1.5 py-0.5 rounded border font-mono">
                                        {item.type}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground uppercase bg-gray-50 px-1.5 py-0.5 rounded border font-mono">
                                        {rawItem.content_source || 'external'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                                <Link 
                                    href={ROUTES.tenant(tenantSlug).employee.learn(
                                        courseId, 
                                        item.module_id, 
                                        item.id
                                    )}
                                    className="flex items-center gap-2"
                                >
                                    {item.type === 'video' || item.type === 'youtube' ? (
                                        <>
                                            <PlayCircle className="h-4 w-4" />
                                            Watch Now
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="h-4 w-4" />
                                            View Content
                                        </>
                                    )}
                                </Link>
                            </Button>
                        </div>
                    </div>
                 )
            })}
        </div>
    )
}
