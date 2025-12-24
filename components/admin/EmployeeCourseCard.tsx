'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContentItem {
    id: string
    title: string
    completed: boolean
}

interface Module {
    id: string
    title: string
    total_items: number
    completed_items: number
    content_details: ContentItem[]
}

interface Course {
    id: string
    title: string
    progress_percentage: number
    completed: number
    total: number
    modules: Module[]
}

function ProgressBar({ percentage }: { percentage: number }) {
    const getColor = () => {
        if (percentage === 100) return 'bg-green-500'
        if (percentage >= 50) return 'bg-blue-500'
        if (percentage > 0) return 'bg-yellow-500'
        return 'bg-gray-300'
    }

    return (
        <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${getColor()} transition-all`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-sm font-medium text-gray-700 w-12">{percentage}%</span>
        </div>
    )
}

export function EmployeeCourseCard({ course }: { course: Course }) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="mb-4 bg-white border rounded-lg overflow-hidden transition-all duration-200">
            {/* Course Header - Clickable for toggling */}
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-gray-50 hover:bg-gray-100 border-b px-6 py-4 cursor-pointer transition-colors"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                        <div>
                            <h2 className="text-xl font-semibold">{course.title}</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {course.completed} of {course.total} items completed
                            </p>
                        </div>
                    </div>
                    <ProgressBar percentage={course.progress_percentage} />
                </div>
            </div>

            {/* Collapsible Module Tree View */}
            <div 
                className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <div className="p-6 pt-2">
                        {course.modules.length === 0 && (
                            <p className="text-gray-500 text-center py-8">No modules in this course yet.</p>
                        )}
                        {course.modules.map((module, idx) => (
                            <div key={module.id} className="mb-6 last:mb-0">
                                {/* Module Header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{module.title}</h3>
                                        <p className="text-xs text-gray-500">
                                            {module.completed_items}/{module.total_items} completed
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium text-gray-600">
                                        {module.total_items > 0 
                                            ? `${Math.round((module.completed_items / module.total_items) * 100)}%`
                                            : '0%'
                                        }
                                    </div>
                                </div>

                                {/* Content Items */}
                                {module.content_details.length > 0 && (
                                    <div className="ml-11 space-y-2">
                                        {module.content_details.map((item) => (
                                            <div 
                                                key={item.id} 
                                                className="flex items-center gap-2 text-sm py-1.5 px-3 rounded hover:bg-gray-50"
                                            >
                                                {item.completed ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                                                )}
                                                <span className={item.completed ? 'text-gray-600' : 'text-gray-800'}>
                                                    {item.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {module.content_details.length === 0 && (
                                    <div className="ml-11 text-sm text-gray-400 italic">
                                        No content items yet
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
