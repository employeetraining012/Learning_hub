'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import { ChevronRight, Search } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Employee = {
    id: string
    full_name: string
    email: string
    courses_assigned: number
    items_completed: number
}

export function ProgressTrackingClient({ 
    employees,
    tenantSlug 
}: { 
    employees: Employee[]
    tenantSlug: string 
}) {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Filter employees based on search
    const filteredEmployees = useMemo(() => {
        if (!searchQuery.trim()) return employees

        const query = searchQuery.toLowerCase()
        return employees.filter(emp => 
            emp.full_name?.toLowerCase().includes(query) ||
            emp.email?.toLowerCase().includes(query)
        )
    }, [employees, searchQuery])

    // Paginate filtered results
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage)

    // Reset to page 1 when search query changes
    const handleSearch = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {searchQuery && (
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSearch('')}
                    >
                        Clear
                    </Button>
                )}
                <div className="text-sm text-gray-500">
                    {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'}
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="font-semibold">Employee Name</TableHead>
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="text-center font-semibold">Courses Assigned</TableHead>
                            <TableHead className="text-center font-semibold">Items Completed</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedEmployees.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                                    {searchQuery ? 'No employees found matching your search.' : 'No employees found.'}
                                </TableCell>
                            </TableRow>
                        )}
                        {paginatedEmployees.map((employee) => (
                            <TableRow key={employee.id} className="hover:bg-gray-50">
                                <TableCell className="font-medium">{employee.full_name || 'Unnamed'}</TableCell>
                                <TableCell className="text-gray-600">{employee.email}</TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm">
                                        {employee.courses_assigned}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-700 font-semibold text-sm">
                                        {employee.items_completed}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link 
                                        href={ROUTES.tenant(tenantSlug).admin.employeeProgress(employee.id)}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                        View Details <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // Show first page, last page, current page, and pages around current
                                    return page === 1 || 
                                           page === totalPages || 
                                           Math.abs(page - currentPage) <= 1
                                })
                                .map((page, idx, arr) => {
                                    // Add ellipsis if there's a gap
                                    const prevPage = arr[idx - 1]
                                    const showEllipsis = prevPage && page - prevPage > 1
                                    
                                    return (
                                        <div key={page} className="flex items-center gap-1">
                                            {showEllipsis && <span className="px-2">...</span>}
                                            <Button
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(page)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {page}
                                            </Button>
                                        </div>
                                    )
                                })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
