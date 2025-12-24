'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type AuditLog = {
    id: string
    action: string
    entity_type: string
    entity_id: string
    actor_email: string
    created_at: string
    metadata: any
}

export function AuditLogsClient({ logs }: { logs: AuditLog[] }) {
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15

    const totalPages = Math.ceil(logs.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedLogs = logs.slice(startIndex, startIndex + itemsPerPage)

    return (
        <div className="space-y-4">
            <div className="border rounded-lg bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="font-semibold">Time</TableHead>
                            <TableHead className="font-semibold">Actor</TableHead>
                            <TableHead className="font-semibold">Action</TableHead>
                            <TableHead className="font-semibold">Entity</TableHead>
                            <TableHead className="font-semibold">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedLogs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-gray-50">
                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                    {new Date(log.created_at).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-sm">{log.actor_email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{log.action}</Badge>
                                </TableCell>
                                <TableCell className="text-sm capitalize">
                                    {log.entity_type}
                                    <span className="block text-xs text-muted-foreground font-mono truncate w-24">
                                        {log.entity_id}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <pre className="text-xs text-gray-500 overflow-x-auto max-w-[200px]">
                                        {log.metadata ? JSON.stringify(log.metadata, null, 2) : '-'}
                                    </pre>
                                </TableCell>
                            </TableRow>
                        ))}
                        {paginatedLogs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, logs.length)} of {logs.length} logs
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
                                    return page === 1 || 
                                           page === totalPages || 
                                           Math.abs(page - currentPage) <= 1
                                })
                                .map((page, idx, arr) => {
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
