'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { GraduationCap } from 'lucide-react'
import { ROUTES } from '@/lib/config/routes'

export function AuthImageSide() {
    const pathname = usePathname()
    
    // Determine image based on route
    let imageSrc = '/auth-login.png' // Default (Login)
    
    if (pathname === ROUTES.signup) {
        imageSrc = '/auth-signup.png'
    } else if (pathname === ROUTES.forgotPassword) {
        imageSrc = '/auth-forgot-pass.png'
    }

    return (
      <div className="hidden lg:flex relative h-full w-full bg-black items-center justify-center overflow-hidden">
        <Image
          src={imageSrc}
          alt="Authentication Background"
          fill
          className="object-cover opacity-80 transition-opacity duration-500"
          priority
          key={imageSrc} // Force re-render on image change for smooth transition
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        
        {/* Logo Overlay */}
        <div className="absolute top-12 left-12 z-10 flex items-center gap-2">
           <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
               <GraduationCap className="h-8 w-8 text-white" />
           </div>
           <span className="text-2xl font-bold text-white tracking-tight">Learning Hub</span>
        </div>
      </div>
    )
}
