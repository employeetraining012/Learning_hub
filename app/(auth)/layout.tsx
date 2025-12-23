import { AuthImageSide } from './AuthImageSide'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4">
       <div className="w-full max-w-[1100px] h-[750px] bg-white rounded-3xl overflow-hidden shadow-2xl grid lg:grid-cols-2">
          {/* Left: Cyberpunk Visuals (Dynamic) */}
          <AuthImageSide />

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
