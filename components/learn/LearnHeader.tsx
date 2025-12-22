'use client'

import React from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

type LearnHeaderProps = {
    courseTitle: string
    tenantSlug: string
    courseId: string
    contentTitle: string
}

export function LearnHeader({ courseTitle, tenantSlug, courseId, contentTitle }: LearnHeaderProps) {
    return (
        <header className="h-16 bg-[#2d2f31] text-white flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50 shadow-md">
            <div className="flex items-center gap-4 overflow-hidden">
                <Button variant="ghost" size="sm" asChild className="text-gray-300 hover:text-white hover:bg-white/10 shrink-0 h-10 px-2">
                    <Link href={ROUTES.tenant(tenantSlug).employee.course(courseId)} className="flex items-center gap-2">
                         <ChevronLeft className="w-5 h-5" />
                         <span className="font-semibold hidden sm:inline">Back to Course</span>
                    </Link>
                </Button>
                
                <div className="h-8 w-px bg-gray-600 shrink-0 mx-2 hidden sm:block" />
                
                <div className="flex flex-col overflow-hidden">
                    <h1 className="font-bold text-base truncate leading-tight tracking-tight">{courseTitle}</h1>
                    {contentTitle && <span className="text-xs text-gray-400 truncate mt-0.5">{contentTitle}</span>}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 rounded-md border border-gray-600/50">
                     <span className="text-xs font-semibold text-gray-300">Learning Mode</span>
                </div>
            </div>
        </header>
    )
}
