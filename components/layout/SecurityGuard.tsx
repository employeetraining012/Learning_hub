'use client'

import { useEffect, useState } from 'react'

export function SecurityGuard({ children }: { children: React.ReactNode }) {
    const [isDev, setIsDev] = useState(false)

    useEffect(() => {
        // Only apply to production/employees if needed, or always as requested
        
        // 1. Disable Right-click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
        }

        // 2. Disable Copy/Cut/Paste
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault()
        }
        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault()
        }
        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault()
        }

        // 3. Disable DevTools Shortcuts & Copy/Paste Keyboard Shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block F12
            if (e.key === 'F12') {
                e.preventDefault()
            }

            // Block Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                e.preventDefault()
            }

            // Block Ctrl+U (View Source)
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault()
            }

            // Block Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+S
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'v' || e.key === 's')) {
                e.preventDefault()
            }
        }

        // 4. (Optional) Detect Print Screen and Clear Clipboard
        // Note: Browsers cannot actually block the OS PrintScreen button reliably,
        // but we can detect visibility change and obscure content.
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Clear any potential sensitive data if needed
            }
        }

        document.addEventListener('contextmenu', handleContextMenu)
        document.addEventListener('copy', handleCopy)
        document.addEventListener('cut', handleCut)
        document.addEventListener('paste', handlePaste)
        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu)
            document.removeEventListener('copy', handleCopy)
            document.removeEventListener('cut', handleCut)
            document.removeEventListener('paste', handlePaste)
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    return (
        <div className="select-none h-full">
            {children}
            {/* CSS-based screenshot obfuscation trick: many screenshot tools (like Snagit) 
                honor 'user-select: none' for text but not for images. 
                True hardware-level black screen requires MediaStream APIs or DRM, 
                but we can use a CSS overlay that activates on blur. */}
            <style jsx global>{`
                @media print {
                    body { display: none !important; }
                }
                .security-blur {
                    filter: blur(20px);
                }
            `}</style>
        </div>
    )
}
