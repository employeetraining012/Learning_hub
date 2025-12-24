/**
 * Centralized route configuration for the LearningHub application.
 * Use this to avoid hardcoded URLs across the codebase.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const ROUTES = {
    // Auth Routes
    login: '/login',
    signup: '/signup',
    forgotPassword: '/forgot-password',
    updatePassword: '/update-password',
    auth: {
        callback: '/auth/callback',
        signout: '/auth/signout',
    },

    // Public / Home
    home: '/',
    setup: '/setup',

    // Tenant-specific routes (Dynamic)
    tenant: (slug: string) => ({
        dashboard: `/t/${slug}`,

        // Admin routes
        admin: {
            dashboard: `/t/${slug}/admin`,
            employees: `/t/${slug}/admin/employees`,
            courses: `/t/${slug}/admin/courses`,
            courseDetail: (courseId: string) => `/t/${slug}/admin/courses/${courseId}`,
            modules: (courseId: string) => `/t/${slug}/admin/courses/${courseId}/modules`,
            content: (moduleId: string) => `/t/${slug}/admin/modules/${moduleId}/content`,
            assignments: `/t/${slug}/admin/assignments`,
            cohorts: `/t/${slug}/admin/cohorts`,
            cohortsNew: `/t/${slug}/admin/cohorts/new`,
            cohortDetail: (cohortId: string) => `/t/${slug}/admin/cohorts/${cohortId}`,
            audit: `/t/${slug}/admin/audit`,
            search: `/t/${slug}/admin/search`,
            import: `/t/${slug}/admin/tools/import`,
            progress: `/t/${slug}/admin/progress`,
            employeeProgress: (employeeId: string) => `/t/${slug}/admin/progress/${employeeId}`,
        },

        // Employee routes
        employee: {
            dashboard: `/t/${slug}/employee`,
            course: (courseId: string) => `/t/${slug}/employee/courses/${courseId}`,
            module: (moduleId: string) => `/t/${slug}/employee/modules/${moduleId}`,
            content: (contentId: string) => `/t/${slug}/employee/content/${contentId}`,
            learn: (courseId: string, moduleId: string, contentId: string) =>
                `/t/${slug}/employee/learn/${courseId}/${moduleId}/${contentId}`,
        },
    })
};
