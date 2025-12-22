'use client'

import React, { useState } from 'react'
import { EmployeeSelector } from '@/components/assignments/EmployeeSelector'
import { CourseAssignmentGrid } from '@/components/assignments/CourseAssignmentGrid'
import { Profile, Course } from '@/types/db'

export default function AssignmentsManager({ 
    employees, 
    courses,
    tenantId,
    tenantSlug
}: { 
    employees: Profile[], 
    courses: Course[],
    tenantId: string,
    tenantSlug: string
}) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 p-4 border rounded-md bg-white">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select Employee</h2>
                <EmployeeSelector 
                    employees={employees} 
                    selectedId={selectedEmployeeId}
                    onSelect={setSelectedEmployeeId}
                    tenantId={tenantId}
                />
            </div>
            
            <CourseAssignmentGrid 
                employeeId={selectedEmployeeId} 
                allCourses={courses}
                tenantId={tenantId}
                tenantSlug={tenantSlug}
            />
        </div>
    )
}
