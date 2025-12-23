'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { GraduationCap } from 'lucide-react'
import { ROUTES } from '@/lib/config/routes'

export function AuthImageSide() {
    return (
      <div className="hidden lg:flex relative h-full w-full bg-black items-center justify-center overflow-hidden">
        <Image
          src="/auth-vr-headset.png"
          alt="Authentication Background"
          fill
          className="object-cover"
          priority
        />
        {/* Subtle Overlay to ensure logo visibility */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Logo Overlay */}
        <div className="absolute top-8 left-8 z-10 flex items-center gap-2">
           <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
               <GraduationCap className="h-8 w-8 text-white" />
           </div>
           <span className="text-2xl font-bold text-white tracking-tight">Learning Hub</span>
        </div>
      </div>
    )
}
