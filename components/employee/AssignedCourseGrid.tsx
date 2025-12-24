import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

// Type for assigned courses (subset of full Course)
type AssignedCourse = {
    id: string
    title: string
    status: string
    description?: string | null
    image_url?: string | null
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
                        <div className="relative h-40 w-full bg-gray-100">
                            <img 
                                src={course.image_url} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="relative h-40 w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-white/50" />
                        </div>
                    )}
                    
                    <CardHeader className="pb-2">
                        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2 min-h-[40px]">
                            {course.description || 'No description available'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {/* Progress could go here in Phase 3 */}
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href={ROUTES.tenant(tenantSlug).employee.course(course.id)}>
                                View Modules
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
