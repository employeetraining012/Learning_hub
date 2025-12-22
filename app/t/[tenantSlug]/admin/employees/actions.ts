'use server'

import { createServiceRoleClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/admin/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { SITE_URL, ROUTES } from '@/lib/config/routes'

// Schema for Creating User
const createUserSchema = z.object({
    email: z.string().email(),
    fullName: z.string().min(2),
    role: z.enum(['admin', 'employee']),
    password: z.string().min(6)
})

export async function createEmployee(formData: FormData, tenantId: string, tenantSlug: string) {
    // 1. Authorization Check (Must be standard Admin)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Validate
    const raw = {
        email: formData.get('email'),
        fullName: formData.get('fullName'),
        role: formData.get('role'),
        password: formData.get('password')
    }

    const valid = createUserSchema.safeParse(raw)
    if (!valid.success) return { error: valid.error.issues[0].message }
    const { email, fullName, role, password } = valid.data

    // 3. Create via Service Role (Bypasses Auth restricts)
    const adminClient = createServiceRoleClient()

    // Check if user already exists in global profiles
    const { data: existingProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    let userId = existingProfile?.id

    if (!userId) {
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                force_password_reset: true
            }
        })

        if (createError) return { error: createError.message }
        if (!newUser.user) return { error: 'Failed to create user object' }
        userId = newUser.user.id

        // Create profile (trigger should do this, but being explicit)
        await adminClient.from('profiles').upsert({
            id: userId,
            email,
            full_name: fullName,
            active: true
        })
    }

    // 4. Add to Tenant Membership
    const { error: membershipError } = await adminClient
        .from('tenant_memberships')
        .upsert({
            tenant_id: tenantId,
            user_id: userId,
            role: role as any
        })

    if (membershipError) return { error: membershipError.message }

    // 5. Audit
    await logAudit({
        tenantId,
        action: 'USER_CREATE',
        entityType: 'user',
        entityId: userId,
        metadata: { email, role, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.employees)
    return { success: true, message: 'Employee created successfully. Please share the temporary password with them.' }
}

export async function toggleEmployeeStatus(employeeId: string, currentStatus: boolean, tenantId: string, tenantSlug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (employeeId === user?.id) {
        return { error: "You cannot deactivate your own account." }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ active: !currentStatus })
        .eq('id', employeeId)

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'USER_UPDATE',
        entityType: 'profile',
        entityId: employeeId,
        metadata: { active: !currentStatus, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.employees)
    return { success: true }
}

export async function updateEmployeeRole(employeeId: string, newRole: 'admin' | 'employee', tenantSlug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Note: Role is now in tenant_memberships, but we might still have it in profiles for legacy/global support.
    // Let's update tenant_memberships primarily.

    // We need tenantId to update membership. We can derive it from the path or pass it.
    // I'll derive from current tenant context in action if possible, or just pass it.
    // Passing it is safer. But I'll use slug for now and assume single membership update for that tenant.

    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single()
    if (!tenant) return { error: "Tenant not found" }

    const { error } = await supabase
        .from('tenant_memberships')
        .update({ role: newRole })
        .eq('user_id', employeeId)
        .eq('tenant_id', tenant.id)

    if (error) return { error: error.message }

    await logAudit({
        tenantId: tenant.id,
        action: 'USER_UPDATE',
        entityType: 'membership',
        entityId: employeeId,
        metadata: { role: newRole, tenantId: tenant.id }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.employees)
    return { success: true }
}

export async function sendMagicLink(email: string, tenantId: string, tenantSlug: string) {
    const supabase = await createClient()
    const adminClient = createServiceRoleClient()

    // Generate magic link
    const { error } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
            redirectTo: `${SITE_URL}${ROUTES.auth.callback}`
        }
    })

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'SEND_MAGIC_LINK',
        entityType: 'user',
        entityId: email,
        metadata: { email, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.employees)
    return { success: true, message: 'Magic link email sent successfully' }
}

export async function sendPasswordReset(email: string, tenantId: string, tenantSlug: string) {
    const adminClient = createServiceRoleClient()

    const { error } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
            redirectTo: `${SITE_URL}${ROUTES.auth.callback}`
        }
    })

    if (error) return { error: error.message }

    await logAudit({
        tenantId,
        action: 'SEND_PASSWORD_RESET',
        entityType: 'user',
        entityId: email,
        metadata: { email, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.employees)
    return { success: true, message: 'Password reset email sent successfully' }
}

export async function deleteEmployee(employeeId: string, tenantId: string, tenantSlug: string) {
    // Validate required parameters
    if (!employeeId || !tenantId || !tenantSlug) {
        console.error('deleteEmployee: Missing params', { employeeId, tenantId, tenantSlug })
        return { error: `Missing required parameters. employeeId: ${!!employeeId}, tenantId: ${!!tenantId}, tenantSlug: ${!!tenantSlug}` }
    }

    console.log('deleteEmployee called:', { employeeId, tenantId, tenantSlug })

    const supabase = await createClient()
    const adminClient = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Cannot delete self
    if (employeeId === user?.id) {
        return { error: "You cannot delete your own account." }
    }

    // Get employee info for audit
    const { data: profile } = await adminClient
        .from('profiles')
        .select('email, full_name')
        .eq('id', employeeId)
        .single()

    console.log('Found profile:', profile)

    // Remove from tenant membership
    const { data: deleteData, error: membershipError } = await adminClient
        .from('tenant_memberships')
        .delete()
        .eq('user_id', employeeId)
        .eq('tenant_id', tenantId)
        .select()

    console.log('Delete membership result:', { deleteData, membershipError })

    if (membershipError) return { error: membershipError.message }

    // Also delete from profiles table
    const { error: profileError } = await adminClient
        .from('profiles')
        .delete()
        .eq('id', employeeId)

    console.log('Delete profile result:', { profileError })

    // Delete from auth.users (permanent deletion)
    const { error: authError } = await adminClient.auth.admin.deleteUser(employeeId)

    console.log('Delete auth user result:', { authError })

    if (authError) {
        console.error('Failed to delete auth user:', authError)
        // Don't return error - membership is already deleted
    }

    // Log audit using adminClient to bypass RLS
    try {
        await adminClient.from('audit_logs').insert({
            actor_id: user?.id,
            actor_email: user?.email,
            action: 'REMOVE_FROM_TENANT',
            entity_type: 'membership',
            entity_id: employeeId,
            tenant_id: tenantId,
            metadata: {
                email: profile?.email,
                fullName: profile?.full_name,
                permanentDelete: true
            }
        })
    } catch (auditErr) {
        console.error('Audit log failed:', auditErr)
    }

    revalidatePath(ROUTES.tenant(tenantSlug).admin.employees)
    return { success: true }
}

export async function resetEmployeePassword(employeeId: string, newPassword: string, tenantId: string, tenantSlug: string) {
    const adminClient = createServiceRoleClient()

    // 1. Update password and set force_password_reset flag
    const { error } = await adminClient.auth.admin.updateUserById(employeeId, {
        password: newPassword,
        user_metadata: {
            force_password_reset: true
        }
    })

    if (error) return { error: error.message }

    // 2. Audit
    await logAudit({
        tenantId,
        action: 'USER_UPDATE',
        entityType: 'user',
        entityId: employeeId,
        metadata: { password_reset: true, manual_override: true, tenantId }
    })

    revalidatePath(ROUTES.tenant(tenantSlug).admin.employees)
    return { success: true, message: 'Password has been overridden successfully.' }
}
