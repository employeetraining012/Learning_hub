import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getDirectGoogleDriveLink(url: string | null | undefined) {
  if (!url) return url
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([^/]+)/) || url.match(/id=([^&]+)/)
    if (match && match[1]) {
      // Use local proxy to bypass CORS/Hotlinking protection
      return `/api/proxy/image?driveId=${match[1]}`
    }
  }
  return url
}
