import { getTenantContext } from '@/lib/tenant/context'
import { notFound, redirect } from 'next/navigation'
import { ROUTES } from '@/lib/config/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createCohort } from '../actions'

export default async function NewCohortPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
    const { tenantSlug } = await params
    const tenant = await getTenantContext(tenantSlug)
    if (!tenant) notFound()

    async function handleSubmit(formData: FormData) {
        'use server'
        const { tenantSlug } = await params
        const tenant = await getTenantContext(tenantSlug)
        if (!tenant) return

        const result = await createCohort(formData, tenant.id)
        if (result.success) {
            redirect(ROUTES.tenant(tenantSlug).admin.cohorts)
        }
    }

    return (
        <div className="max-w-2xl">
            <Link href={ROUTES.tenant(tenantSlug).admin.cohorts}>
                <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Cohorts
                </Button>
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Create Cohort</h1>
                <p className="text-muted-foreground mt-2">Create a new employee group for batch assignments.</p>
            </div>

            <form action={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
                <div className="space-y-2">
                    <Label htmlFor="name">Cohort Name *</Label>
                    <Input id="name" name="name" required placeholder="e.g., Engineering Team 2024" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                        id="description" 
                        name="description" 
                        placeholder="Optional description"
                        rows={4}
                    />
                </div>

                <div className="flex gap-3">
                    <Button type="submit">Create Cohort</Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href={ROUTES.tenant(tenantSlug).admin.cohorts}>Cancel</Link>
                    </Button>
                </div>
            </form>
        </div>
    )
}
