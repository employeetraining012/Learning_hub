import Image from 'next/image'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full h-screen grid lg:grid-cols-2">
      {/* Left: Cyberpunk Visuals */}
      <div className="hidden lg:flex relative h-full w-full bg-black items-center justify-center overflow-hidden">
        <Image
          src="/auth-cyberpunk.png"
          alt="Authentication Background"
          fill
          className="object-cover opacity-80"
          priority
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

      {/* Right: Form Area */}
      <div className="flex h-full w-full items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-[400px] flex flex-col justify-center">
            {children}
        </div>
      </div>
    </div>
  )
}
