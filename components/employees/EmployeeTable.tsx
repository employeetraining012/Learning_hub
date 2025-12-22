'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Shield, User, Mail, Key, Trash2, Crown, UserCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
    toggleEmployeeStatus, 
    updateEmployeeRole,
    sendMagicLink,
    sendPasswordReset,
    deleteEmployee,
    resetEmployeePassword
} from '@/app/t/[tenantSlug]/admin/employees/actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { ROUTES } from '@/lib/config/routes'

interface EmployeeWithDetails {
    id: string
    full_name: string
    email: string
    role: string
    active: boolean
    created_at: string
    joined_at?: string
    last_sign_in_at?: string
    confirmed_at?: string
}

interface EmployeeTableProps {
    employees: EmployeeWithDetails[]
    tenantSlug: string
    tenantId: string
}

export function EmployeeTable({ employees, tenantSlug, tenantId }: EmployeeTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleToggleStatus = async (emp: EmployeeWithDetails) => {
        if (!confirm(`Are you sure you want to ${emp.active ? 'deactivate' : 'activate'} ${emp.full_name}?`)) return
        
        setLoadingId(emp.id)
        const res = await toggleEmployeeStatus(emp.id, emp.active, tenantId, tenantSlug)
        setLoadingId(null)

        if (res.error) toast.error(res.error)
        else toast.success(`User ${emp.active ? 'deactivated' : 'activated'}`)
    }

    const handleRoleChange = async (emp: EmployeeWithDetails, newRole: 'admin' | 'employee') => {
        if (!confirm(`Change role of ${emp.full_name} to ${newRole}?`)) return

        setLoadingId(emp.id)
        const res = await updateEmployeeRole(emp.id, newRole, tenantSlug)
        setLoadingId(null)

        if (res.error) toast.error(res.error)
        else toast.success(`Role updated to ${newRole}`)
    }

    const handleSendMagicLink = async (emp: EmployeeWithDetails) => {
        if (!confirm(`Send a magic link to ${emp.email}?`)) return

        setLoadingId(emp.id)
        const res = await sendMagicLink(emp.email, tenantId, tenantSlug)
        setLoadingId(null)

        if (res.error) toast.error(res.error)
        else toast.success(res.message || 'Magic link sent!')
    }

    const handleOverridePassword = async (emp: EmployeeWithDetails) => {
        const newPassword = window.prompt(`Enter a new temporary password for ${emp.full_name} (min 6 chars):`)
        if (!newPassword) return
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoadingId(emp.id)
        const res = await resetEmployeePassword(emp.id, newPassword, tenantId, tenantSlug)
        setLoadingId(null)

        if (res.error) toast.error(res.error)
        else toast.success(res.message || 'Password overridden!')
    }

    const handleDelete = async (emp: EmployeeWithDetails) => {
        if (!confirm(`Remove ${emp.full_name} from this organization? They will no longer have access.`)) return

        setLoadingId(emp.id)
        const res = await deleteEmployee(emp.id, tenantId, tenantSlug)
        setLoadingId(null)

        if (res.error) toast.error(res.error)
        else toast.success(`${emp.full_name} removed from organization`)
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return <Crown className="w-4 h-4 text-amber-500" />
            case 'admin': return <Shield className="w-4 h-4 text-purple-600" />
            case 'trainer': return <UserCheck className="w-4 h-4 text-blue-600" />
            default: return <User className="w-4 h-4 text-gray-500" />
        }
    }

    if (employees.length === 0) {
        return (
            <div className="border rounded-md p-8 text-center text-muted-foreground">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-1">No employees yet</h3>
                <p className="text-sm">Add your first employee to get started.</p>
            </div>
        )
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((emp, index) => (
                        <TableRow key={emp.id || `emp-${index}`} className={loadingId === emp.id ? 'opacity-50' : ''}>
                            <TableCell className="font-medium">{emp.full_name}</TableCell>
                            <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {getRoleIcon(emp.role)}
                                    <span className="capitalize">{emp.role}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge 
                                    variant={emp.active ? 'default' : 'destructive'} 
                                    className={`
                                        ${emp.active 
                                            ? (emp.confirmed_at || emp.last_sign_in_at) 
                                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
                                                : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                                            : ''
                                        }
                                    `}
                                >
                                    {!emp.active ? 'Inactive' : (
                                        (emp.confirmed_at || emp.last_sign_in_at) ? 'Active' : 'Pending'
                                    )}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {formatDate(emp.joined_at || emp.created_at)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {formatDate(emp.last_sign_in_at)}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loadingId === emp.id}>
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(emp.email)}>
                                            Copy Email
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        
                                        {/* Auth Actions */}
                                        <DropdownMenuItem onClick={() => handleSendMagicLink(emp)}>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Magic Link
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleOverridePassword(emp)}>
                                            <Key className="mr-2 h-4 w-4" />
                                            Override Password
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        
                                        {/* Status Actions */}
                                        <DropdownMenuItem onClick={() => handleToggleStatus(emp)}>
                                            {emp.active ? 'Deactivate User' : 'Activate User'}
                                        </DropdownMenuItem>
                                        
                                        {/* Role Actions */}
                                        {emp.role !== 'owner' && (
                                            emp.role === 'employee' ? (
                                                <DropdownMenuItem onClick={() => handleRoleChange(emp, 'admin')}>
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Promote to Admin
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem onClick={() => handleRoleChange(emp, 'employee')}>
                                                    <User className="mr-2 h-4 w-4" />
                                                    Demote to Employee
                                                </DropdownMenuItem>
                                            )
                                        )}
                                        <DropdownMenuSeparator />
                                        
                                        {/* Destructive Actions */}
                                        {emp.role !== 'owner' && (
                                            <DropdownMenuItem 
                                                onClick={() => handleDelete(emp)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove from Org
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
