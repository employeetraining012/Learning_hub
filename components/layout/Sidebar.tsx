'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Folder, Home, Library, Settings, Users, Search, Activity, BarChart3 } from 'lucide-react'
import { ROUTES } from '@/lib/config/routes'

export function Sidebar() {
  const pathname = usePathname()
  const params = useParams()
  const tenantSlug = params.tenantSlug as string

  const tenantRoutes = ROUTES.tenant(tenantSlug).admin
  const navigation = [
    { name: 'Dashboard', href: tenantRoutes.dashboard, icon: Home },
    { name: 'Courses', href: tenantRoutes.courses, icon: Library },
    { name: 'Assignments', href: tenantRoutes.assignments, icon: Settings },
    { name: 'Employees', href: tenantRoutes.employees, icon: Users },
    { name: 'Cohorts', href: tenantRoutes.cohorts, icon: Folder },
    { name: 'Track Progress', href: tenantRoutes.progress, icon: BarChart3 },
    { name: 'Search', href: tenantRoutes.search, icon: Search },
    { name: 'Audit Logs', href: tenantRoutes.audit, icon: Activity },
  ]

  return (
    <div className="flex flex-col w-64 border-r bg-gray-100/40 min-h-screen">
      <div className="p-6 border-b bg-white">
        <h1 className="text-xl font-bold tracking-tight">Learning Hub</h1>
        <p className="text-xs text-gray-500">Admin Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href.split('/').length > 4 && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-gray-900 text-white" 
                    : "text-gray-700 hover:bg-gray-200"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
        })}
      </nav>
      <div className="p-4 border-t bg-white">
        <div className="text-xs text-gray-500 text-center">
            {tenantSlug}
        </div>
      </div>
    </div>
  )
}
