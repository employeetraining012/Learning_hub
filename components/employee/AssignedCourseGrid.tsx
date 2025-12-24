import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

// Type for assigned courses with progress
type AssignedCourse = {
    id: string
    title: string
    status: string
    description?: string | null
    image_url?: string | null
    progress_percentage?: number
    progress_completed?: number
    progress_total?: number
}

// Circular Progress Component
function CircularProgress({ percentage }: { percentage: number }) {
    const radius = 18
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    
    const getColor = () => {
        if (percentage === 100) return 'text-green-500'
        if (percentage >= 50) return 'text-blue-500'
        if (percentage > 0) return 'text-yellow-500'
        return 'text-gray-300'
    }

    return (
        <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="transform -rotate-90 w-12 h-12">
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200"
                />
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    className={getColor()}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset,
                        transition: 'stroke-dashoffset 0.3s ease'
                    }}
                />
            </svg>
            <span className="absolute text-xs font-bold text-gray-700">
                {percentage}%
            </span>
        </div>
    )
}

export function AssignedCourseGrid({ courses, tenantSlug }: { courses: AssignedCourse[], tenantSlug: string }) {
    if (courses.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium">No courses assigned yet.</h3>
                <p className="text-muted-foreground">Check back later or contact your administrator.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
                <Card key={course.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Course Image */}
                    {course.image_url ? (
                        <div className="relative h-44 w-full bg-gray-100 flex items-center justify-center p-2">
                            <img 
                                src={course.image_url} 
                                alt={course.title}
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        </div>
                    ) : (
                        <div className="relative h-44 w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-white/50" />
                        </div>
                    )}
                    
                    <CardHeader className="pb-2 pt-4">
                        <div className="flex items-start justify-between gap-3">
                            <CardTitle className="text-lg font-semibold leading-tight flex-1">{course.title}</CardTitle>
                            <CircularProgress percentage={course.progress_percentage || 0} />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {course.description || 'No description available'}
                        </p>
                        {course.progress_total !== undefined && course.progress_total > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                                {course.progress_completed} of {course.progress_total} items completed
                            </p>
                        )}
                    </CardContent>
                    <CardFooter className="pt-4">
                        <Button asChild className="w-full">
                            <Link href={ROUTES.tenant(tenantSlug).employee.course(course.id)}>
                                {course.progress_percentage === 100 ? 'Review Course' : 'Continue Learning'}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
