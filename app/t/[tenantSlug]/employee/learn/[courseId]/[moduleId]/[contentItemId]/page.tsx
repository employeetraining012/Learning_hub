import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { fetchCourseTree } from '@/lib/learn/course-tree'
import { computeNextPrev } from '@/lib/learn/navigation'
import { LearnHeader } from '@/components/learn/LearnHeader'
import { CourseSidebar } from '@/components/learn/CourseSidebar'
import { Player } from '@/components/learn/Player'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Main Page Component
export default async function LearnPage({ 
    params 
}: { 
    params: Promise<{ 
        tenantSlug: string, 
        courseId: string, 
        moduleId: string, 
        contentItemId: string 
    }> 
}) {
    const { tenantSlug, courseId, moduleId, contentItemId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect(ROUTES.login)

    // Fetch full course tree (with security checks)
    const tree = await fetchCourseTree(courseId, user.id)

    if (!tree) notFound()

    // Identify current content item
    const currentModule = tree.modules.find(m => m.id === moduleId)
    const currentItem = currentModule?.items.find(i => i.id === contentItemId)

    if (!currentItem) notFound()

    // Calculate Navigation
    const { prevItem, nextItem } = computeNextPrev(tree, moduleId, contentItemId)

    return (
        <div className="flex flex-col h-screen bg-white">
            <LearnHeader 
                courseTitle={tree.course.title} 
                tenantSlug={tenantSlug} 
                courseId={courseId}
                contentTitle={currentItem.title}
            />

            {/* Main Content Area - Below Header */}
            <div className="flex flex-1 pt-16 overflow-hidden">
                
                {/* Left Panel: Content Player */}
                {/* Width: approx 72-75% on large screens */}
                <main className="flex-1 flex flex-col h-full overflow-y-auto bg-white scrollbar-thin">
                    <div className="w-full max-w-[1600px] mx-auto">
                        
                        {/* 1. Player Container (Forced 16:9 Aspect Ratio) */}
                        <div className="w-full bg-black">
                             <div className="relative w-full pt-[56.25%]"> {/* 16:9 Aspect Ratio Hack */}
                                 <div className="absolute top-0 left-0 right-0 bottom-0">
                                     <Player item={currentItem} />
                                 </div>
                             </div>
                        </div>

                        {/* 2. Metadata & Anchored Controls */}
                        <div className="px-6 py-6 border-b border-gray-200">
                             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                {/* Title Group */}
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{currentItem.title}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                         <span className="font-medium text-gray-900">{currentModule?.title}</span>
                                         <span>•</span>
                                         <span>Lecture {currentModule?.items.findIndex(i => i.id === currentItem.id)! + 1}</span>
                                    </div>
                                </div>

                                {/* Controls Group - Anchored Right */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <Button variant="outline" size="lg" disabled={!prevItem} asChild={!!prevItem} className="h-11 px-6">
                                        {prevItem ? (
                                            <Link href={ROUTES.tenant(tenantSlug).employee.learn(courseId, prevItem.moduleId, prevItem.contentId)}>
                                                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                                            </Link>
                                        ) : (
                                            <span><ChevronLeft className="w-4 h-4 mr-2" /> Previous</span>
                                        )}
                                    </Button>
                                    <Button variant="default" size="lg" disabled={!nextItem} asChild={!!nextItem} className="h-11 px-6 bg-black text-white hover:bg-gray-800">
                                         {nextItem ? (
                                            <Link href={ROUTES.tenant(tenantSlug).employee.learn(courseId, nextItem.moduleId, nextItem.contentId)}>
                                                Next <ChevronRight className="w-4 h-4 ml-2" />
                                            </Link>
                                        ) : (
                                            <span>Next <ChevronRight className="w-4 h-4 ml-2" /></span>
                                        )}
                                    </Button>
                                </div>
                             </div>
                        </div>

                        {/* 3. Description / Tabs (Future) */}
                        <div className="px-6 py-8">
                             <h3 className="font-semibold text-lg mb-2">About this lecture</h3>
                             <p className="text-gray-600 leading-relaxed max-w-4xl">
                                 {currentItem.description || "No description provided for this lecture."}
                             </p>
                        </div>

                    </div>
                </main>

                {/* Right Panel: Sidebar */}
                {/* Fixed width on large screens (~350-400px akin to Udemy) */}
                <aside className="hidden lg:block w-[380px] border-l border-gray-200 bg-white h-full shrink-0 z-20">
                    <CourseSidebar 
                        tree={tree} 
                        currentContentId={contentItemId} 
                        currentModuleId={moduleId} 
                        tenantSlug={tenantSlug} 
                    />
                </aside>
            </div>
        </div>
    )
}
