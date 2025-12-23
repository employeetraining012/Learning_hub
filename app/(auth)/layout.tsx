import { AuthImageSide } from './AuthImageSide'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full h-screen grid lg:grid-cols-2">
      {/* Left: Cyberpunk Visuals (Dynamic) */}
      <AuthImageSide />

      {/* Right: Form Area */}
      <div className="flex h-full w-full items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-[400px] flex flex-col justify-center">
            {children}
        </div>
      </div>
    </div>
  )
}
