'use client'

import { AuthImageSide } from './AuthImageSide'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@/lib/config/routes'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Default Theme (Purple/neutral fallback)
  let theme = {
      gradient: 'bg-gradient-to-br from-slate-900 to-slate-800',
      image: '/auth-vr-headset.png' // Fallback
  }

  // Login: Red Theme
  if (pathname === ROUTES.login) {
      theme = {
          gradient: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/50 via-slate-900 to-black',
          image: '/auth-vr-red.png'
      }
  } 
  // Request Access (Signup): Cyan Theme
  else if (pathname === ROUTES.signup) {
      theme = {
          gradient: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/50 via-slate-900 to-black',
          image: '/auth-vr-cyan.png'
      }
  }
  // Forgot Password: Purple Theme
  else if (pathname === ROUTES.forgotPassword) {
      theme = {
          gradient: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/50 via-slate-900 to-black',
          image: '/auth-vr-purple.png'
      }
  }

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-500 ${theme.gradient}`}>
       <div className="w-full max-w-[1100px] h-[750px] bg-white rounded-3xl overflow-hidden shadow-2xl grid lg:grid-cols-2">
          {/* Left: Dynamic Visuals */}
          <AuthImageSide imageSrc={theme.image} />

          {/* Right: Form Area */}
          <div className="flex h-full w-full items-center justify-center bg-white p-8 lg:p-12 overflow-y-auto">
            <div className="w-full max-w-[420px] flex flex-col justify-center">
                {children}
            </div>
          </div>
       </div>
    </div>
  )
}
