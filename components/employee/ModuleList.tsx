'use client'

import { Module } from '@/types/db'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ROUTES } from '@/lib/config/routes'

export function ModuleList({ modules, tenantSlug }: { modules: Module[], tenantSlug: string }) {
    if (modules.length === 0) {
        return <div className="text-muted-foreground italic">No modules available yet.</div>
    }

    return (
        <div className="space-y-4">
            {modules.map((module: any) => {
                // Determine first content item to play
                // Sort by created_at to be consistent (mocking "order") if DB return isn't sorted
                const items = module.content_items || []
                const firstItem = items.sort((a: any, b: any) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                )[0]

                const hasContent = !!firstItem
                
                // Link logic: 
                // IF content exists -> Go to Player
                // ELSE -> Disable or stay (we'll just use a div or disabled link style)
                const LinkComponent = hasContent ? Link : 'div'
                const href = hasContent 
                    ? ROUTES.tenant(tenantSlug).employee.learn(module.course_id, module.id, firstItem.id)
                    : undefined

                return (
                <LinkComponent 
                    key={module.id} 
                    href={href as string}
                    className={`block p-4 border rounded-lg bg-white transition-all ${
                        hasContent 
                            ? 'hover:border-blue-500 hover:shadow-sm cursor-pointer' 
                            : 'opacity-60 cursor-not-allowed bg-gray-50'
                    }`}
                    onClick={(e) => {
                        if (!hasContent) e.preventDefault()
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold uppercase text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">
                                    Module {module.sort_order}
                                </span>
                                <h3 className="font-medium text-lg text-gray-900">{module.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{module.description}</p>
                            {!hasContent && (
                                <p className="text-xs text-amber-600 mt-2 font-medium">Coming Soon - No content available yet</p>
                            )}
                        </div>
                        {hasContent && <ChevronRight className="w-5 h-5 text-gray-400" />}
                    </div>
                </LinkComponent>
            )})}
        </div>
    )
}
