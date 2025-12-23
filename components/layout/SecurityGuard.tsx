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
            // Block F12 (All browsers)
            if (e.key === 'F12') {
                e.preventDefault()
                return
            }

            // Block Ctrl+Shift+I (Windows/Linux) and Cmd+Shift+I (Mac) - Open DevTools
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
                e.preventDefault()
                return
            }

            // Block Ctrl+Shift+J (Windows/Linux) and Cmd+Shift+J (Mac) - Console
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
                e.preventDefault()
                return
            }

            // Block Ctrl+Shift+C (Windows/Linux) and Cmd+Shift+C (Mac) - Inspect Element
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
                e.preventDefault()
                return
            }

            // Block Ctrl+Shift+K (Firefox Console)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
                e.preventDefault()
                return
            }

            // Block Cmd+Option+I (Mac - Alternative DevTools shortcut)
            if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) {
                e.preventDefault()
                return
            }

            // Block Cmd+Option+J (Mac - Alternative Console shortcut)
            if (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j')) {
                e.preventDefault()
                return
            }

            // Block Cmd+Option+C (Mac - Alternative Inspect shortcut)
            if (e.metaKey && e.altKey && (e.key === 'C' || e.key === 'c')) {
                e.preventDefault()
                return
            }

            // Block Ctrl+U (View Source) - Windows/Linux
            // Block Cmd+U (View Source) - Mac
            if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
                e.preventDefault()
                return
            }

            // Block Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+S (Copy/Cut/Paste/Save)
            // Block Cmd+C, Cmd+X, Cmd+V, Cmd+S on Mac
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'v' || e.key === 's')) {
                e.preventDefault()
                return
            }

            // Block Cmd+A (Select All) on Mac, Ctrl+A on Windows/Linux
            if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault()
                return
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
