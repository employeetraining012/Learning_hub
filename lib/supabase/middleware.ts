import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES } from '@/lib/config/routes'

export async function updateSession(request: NextRequest) {
    // CRITICAL: Validate environment variables before proceeding
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('[Middleware] Missing Supabase environment variables')
        // Return next response to avoid blocking the request
        return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            request.cookies.set(name, value)
                        )
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Do not run code between createServerClient and
        // supabase.auth.getUser(). A simple mistake could make it very hard to debug
        // issues with users being randomly logged out.

        const {
            data: { user },
        } = await supabase.auth.getUser()

        const path = request.nextUrl.pathname;

        // 0. Forced Password Reset Check
        if (user && user.user_metadata?.force_password_reset && path !== ROUTES.updatePassword && !path.startsWith(ROUTES.auth.signout)) {
            const url = request.nextUrl.clone()
            url.pathname = ROUTES.updatePassword
            return NextResponse.redirect(url)
        }

        const pathParts = path.split('/').filter(Boolean);

        // 1. Resolve Tenant Context if path starts with /t/[slug]
        let tenantContext = null;
        if (pathParts[0] === 't' && pathParts[1]) {
            const tenantSlug = pathParts[1];
            const { data: tenant } = await supabase
                .from('tenants')
                .select('id, name, active')
                .eq('slug', tenantSlug)
                .single();

            if (tenant) {
                tenantContext = tenant;
            }
        }

        // 2. Auth Guard for Protected Routes
        // Protected routes are now /t/[tenantSlug]/admin or /t/[tenantSlug]/employee
        const isTenantPath = pathParts[0] === 't';
        const isAdminPath = isTenantPath && pathParts[2] === 'admin';
        const isEmployeePath = isTenantPath && pathParts[2] === 'employee';

        if (!user && (isAdminPath || isEmployeePath)) {
            const url = request.nextUrl.clone()
            url.pathname = ROUTES.login
            return NextResponse.redirect(url)
        }

        // 3. Authorization & Role Guard
        if (user && isTenantPath) {
            if (!tenantContext || !tenantContext.active) {
                // Invalid or inactive tenant
                const url = request.nextUrl.clone()
                url.pathname = ROUTES.home
                return NextResponse.redirect(url)
            }

            const { data: membership } = await supabase
                .from('tenant_memberships')
                .select('role, active')
                .eq('tenant_id', tenantContext.id)
                .eq('user_id', user.id)
                .single();

            // Check Membership
            if (!membership || !membership.active) {
                const url = request.nextUrl.clone()
                url.pathname = ROUTES.home
                return NextResponse.redirect(url)
            }

            // Check Admin Access within Tenant
            if (isAdminPath && !['owner', 'admin', 'trainer'].includes(membership.role)) {
                const url = request.nextUrl.clone()
                url.pathname = ROUTES.tenant(pathParts[1]).employee.dashboard
                return NextResponse.redirect(url)
            }

            // Check Employee Access within Tenant
            if (isEmployeePath && membership.role !== 'employee') {
                // Managers/Admins can see employee view too? 
                // Requirement says: "employee can only read...". 
                // Usually admins should be able to see employee view for testing.
                // If strict: if (membership.role !== 'employee') redirect...
            }
        }

        // 4. Redirect logged in users away from login/signup (to their last/default tenant?)
        if (user && (path === ROUTES.login || path === ROUTES.signup)) {
            const { data: memberships } = await supabase
                .from('tenant_memberships')
                .select('role, tenants(slug)')
                .eq('user_id', user.id)
                .eq('active', true)
                .limit(1);

            const url = request.nextUrl.clone()
            if (memberships && memberships.length > 0) {
                const m = memberships[0];
                const slug = (m.tenants as any).slug;
                const tenantRoutes = ROUTES.tenant(slug);
                url.pathname = ['owner', 'admin', 'trainer'].includes(m.role)
                    ? tenantRoutes.admin.dashboard
                    : tenantRoutes.employee.dashboard;
            } else {
                url.pathname = ROUTES.home
            }
            return NextResponse.redirect(url)
        }

        // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
        // creating a new Response object with NextResponse.redirect() usage, the
        // cookies set in the supabase client above will be lost.
        return supabaseResponse
    } catch (error) {
        console.error('[Middleware] Error in updateSession:', error)
        // Return next response to avoid blocking the request on error
        return NextResponse.next({ request })
    }
}
