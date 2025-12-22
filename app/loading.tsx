
import { GraduationCap, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center gap-2 mb-8 animate-pulse">
        <GraduationCap className="h-12 w-12 text-blue-500" />
        <span className="text-3xl font-bold text-white">Learning Hub</span>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
        <p className="text-slate-400 text-sm">Loading your workspace...</p>
      </div>
    </div>
  )
}
