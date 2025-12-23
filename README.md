# LearningHub 🎓
> The Enterprise AI-Powered Learning Management System for the Modern Workforce.

LearningHub is a premium, multi-tenant learning platform designed to streamline employee onboarding and continuous training. Built with a focus on visual excellence and seamless user experience, it combines a high-tech "Cyberpunk/VR" aesthetic with robust enterprise features.

## ✨ Highlights

### 🎨 Premium Authentication Experience
- **Dynamic Theming**: Page-specific color palettes (Red for Login, Cyan for Requesting Access, Purple for Recovery).
- **Floating Card Layout**: A modern, centered glassmorphic interface on a dark, gradient-rich background.
- **Request Access Flow**: Controlled onboarding where users submit requests directly to administrators.

### 🏢 Enterprise Administration
- **Multi-Tenant Architecture**: Secure, isolated environments for different departments or organizations.
- **Course & Module Builder**: Comprehensive tools to create hierarchical learning paths.
- **Employee Management**: Granular control over user roles (Admin, Employee, Trainer) and active status.
- **Assignments Engine**: Direct mapping of courses to specific employees or cohorts.

### 📖 Intelligent Learning Player
- **Rich Content Support**: Seamlessly embed Google Drive PDFs, Google Slides, Videos, and specialized documents.
- **Smart URL Detection**: Automatically transforms sharing links into optimized, in-app embedded previews.
- **Responsive Navigation**: Fast, fluid transitions between modules and content pieces.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/) (Edge-Ready Middleware)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase Project

### 1. Environment Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # For Admin operations
```

### 2. Database Setup
Execute the SQL migrations found in `db/migrations/` in the following order using the Supabase SQL Editor:
1. `00_init_schema.sql`
2. `01_assignments_schema.sql`
3. `02_audit_schema.sql`
4. Apply RLS policies from `db/policies/`.

### 3. Installation
```bash
npm install
npm run dev
```

## 📁 Project Structure

```text
├── app/                  # Next.js App Router (Layouts, Pages, Routes)
├── components/           # Reusable UI components (shadcn/ui + Custom)
│   ├── auth/             # Brand-specific Auth components
│   ├── learn/            # Multimedia Content Player logic
│   └── admin/            # Advanced Management dashboards
├── lib/                  # Backend utilities, Supabase clients, site config
├── db/                   # SQL Schemas, Migrations, and Seed data
├── public/               # Static assets & Premium background imagery
└── types/                # TypeScript interfaces and DB definitions
```

## 🔒 Security
LearningHub employs strict **Row Level Security (RLS)** in Supabase to ensure that:
- Employees can only access courses assigned to them.
- Admins have exclusive access to tenant-level configuration and audit logs.
- Middleware is Edge-optimized for secure session management without database overhead.

---
*Created with passion for future-focused education.*
