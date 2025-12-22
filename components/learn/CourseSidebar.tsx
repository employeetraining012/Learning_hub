'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import { CourseTree } from '@/lib/learn/course-tree'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, FileText, Link as LinkIcon, PlayCircle, Youtube, ChevronDown, ChevronRight } from 'lucide-react'

type CourseSidebarProps = {
    tree: CourseTree
    currentContentId: string
    currentModuleId: string
    tenantSlug: string
}

export function CourseSidebar({ tree, currentContentId, currentModuleId, tenantSlug }: CourseSidebarProps) {
    const { modules } = tree
    // State for expanded modules (default to current module expanded)
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
        [currentModuleId]: true
    })

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }))
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'youtube':
            case 'video': return <PlayCircle className="w-4 h-4" />
            case 'pdf':
            case 'ppt': return <FileText className="w-4 h-4" />
            default: return <LinkIcon className="w-4 h-4" />
        }
    }

    return (
        <div className="flex flex-col h-full border-l border-gray-200 bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0 h-14">
                <h2 className="font-bold text-sm text-gray-800">Course Content</h2>
                {/* <button className="text-xs text-blue-600 hover:underline">Close</button> */}
            </div>
            
            {/* Native Scroll Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="w-full pb-10">
                    {modules.map((module, index) => {
                        const isExpanded = expandedModules[module.id]
                        return (
                            <div key={module.id} className="border-b border-gray-100 last:border-b-0">
                                {/* Accordion Trigger */}
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className="w-full text-left px-4 py-3 bg-gray-50/50 hover:bg-gray-100 flex justify-between items-start transition-colors group"
                                >
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm text-gray-900 group-hover:text-black">
                                            Section {index + 1}: {module.title}
                                        </div>
                                        <div className="text-xs text-gray-500 font-normal mt-1">
                                            {module.items.length} lectures
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500 mt-1 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-500 mt-1 shrink-0" />}
                                </button>
                                
                                {/* Accordion Content */}
                                {isExpanded && (
                                    <div className="flex flex-col bg-white">
                                        {module.items.map((item, i) => {
                                            const isActive = item.id === currentContentId
                                            return (
                                                <Link
                                                    key={item.id}
                                                    href={ROUTES.tenant(tenantSlug).employee.learn(tree.course.id, module.id, item.id)}
                                                    className={cn(
                                                        "relative flex items-start gap-3 px-4 py-3 text-sm transition-all hover:bg-gray-50",
                                                        isActive 
                                                            ? "bg-gray-100" 
                                                            : "text-gray-700"
                                                    )}
                                                >
                                                    {/* Active Left Border Accent */}
                                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-black" />}

                                                    <div className={cn("mt-0.5 shrink-0", isActive ? "text-black" : "text-gray-400")}>
                                                        {item.is_completed ? <CheckCircle2 className="w-4 h-4" /> : (
                                                            isActive ? getIcon(item.type) : <Circle className="w-3 h-3 mt-0.5" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={cn("text-sm line-clamp-2", isActive ? "font-bold text-black" : "font-normal text-gray-700")}>
                                                            {i+1}. {item.title}
                                                        </div>
                                                        <div className="flex gap-2 mt-1.5 items-center">
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                    {getIcon(item.type)} 
                                                                    <span className="uppercase text-[10px]">{item.type}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                        {module.items.length === 0 && (
                                            <div className="px-4 py-3 text-sm text-gray-400 italic bg-white pl-10">
                                                No lectures yet.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
