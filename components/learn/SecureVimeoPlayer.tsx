'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack, AlertTriangle } from 'lucide-react'

interface SecureVimeoPlayerProps {
    videoId: string
    userEmail?: string
}

export function SecureVimeoPlayer({ videoId, userEmail }: SecureVimeoPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const playerRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showControls, setShowControls] = useState(true)

    // Separate states for different protection types
    const [isBlurred, setIsBlurred] = useState(false)          // Persistent blur (screen recording)
    const [showScreenshotWarning, setShowScreenshotWarning] = useState(false)  // Temporary screenshot warning

    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // SCREEN RECORDING PROTECTION (Persistent - stays until focus returns)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurred(true)
                if (playerRef.current) {
                    playerRef.current.pause()
                }
            } else {
                setIsBlurred(false)
            }
        }

        const handleBlur = () => {
            setIsBlurred(true)
            if (playerRef.current) {
                playerRef.current.pause()
            }
        }

        const handleFocus = () => {
            setIsBlurred(false)
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('blur', handleBlur)
        window.addEventListener('focus', handleFocus)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('blur', handleBlur)
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    // SCREENSHOT PROTECTION (Temporary warning)
    useEffect(() => {
        const showTemporaryWarning = () => {
            setShowScreenshotWarning(true)
            setTimeout(() => setShowScreenshotWarning(false), 2000)
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            // PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault()
                showTemporaryWarning()
                return
            }

            // Windows: Win + Shift + S
            if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's') {
                e.preventDefault()
                showTemporaryWarning()
                return
            }

            // macOS: Cmd + Shift + 3, 4, 5
            if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
                e.preventDefault()
                showTemporaryWarning()
                return
            }
        }

        document.addEventListener('keydown', handleKeyDown, true)
        document.addEventListener('keyup', handleKeyDown, true)

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true)
            document.removeEventListener('keyup', handleKeyDown, true)
        }
    }, [])

    // Vimeo SDK
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://player.vimeo.com/api/player.js'
        script.async = true
        document.body.appendChild(script)

        script.onload = () => {
            if (iframeRef.current && (window as any).Vimeo) {
                const player = new (window as any).Vimeo.Player(iframeRef.current)
                playerRef.current = player

                player.on('play', () => setIsPlaying(true))
                player.on('pause', () => setIsPlaying(false))
                player.on('ended', () => setIsPlaying(false))
                player.on('timeupdate', (data: any) => {
                    setProgress(data.percent * 100)
                    setCurrentTime(data.seconds)
                })
                player.getDuration().then((d: number) => setDuration(d))
            }
        }

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script)
            }
        }
    }, [videoId])

    const resetControlsTimer = useCallback(() => {
        setShowControls(true)
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current)
        }
        if (isPlaying) {
            hideControlsTimeout.current = setTimeout(() => {
                setShowControls(false)
            }, 3000)
        }
    }, [isPlaying])

    useEffect(() => {
        resetControlsTimer()
    }, [isPlaying, resetControlsTimer])

    const togglePlay = () => {
        if (playerRef.current) {
            if (isPlaying) {
                playerRef.current.pause()
            } else {
                playerRef.current.play()
            }
        }
    }

    const toggleMute = () => {
        if (playerRef.current) {
            playerRef.current.setMuted(!isMuted)
            setIsMuted(!isMuted)
        }
    }

    const handleFullscreen = () => {
        if (containerRef.current?.requestFullscreen) {
            containerRef.current.requestFullscreen()
        }
    }

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (playerRef.current && duration) {
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            playerRef.current.setCurrentTime(percent * duration)
        }
    }

    const skipForward = (seconds: number) => {
        if (playerRef.current) {
            playerRef.current.getCurrentTime().then((time: number) => {
                playerRef.current.setCurrentTime(Math.min(time + seconds, duration))
            })
        }
    }

    const skipBackward = (seconds: number) => {
        if (playerRef.current) {
            playerRef.current.getCurrentTime().then((time: number) => {
                playerRef.current.setCurrentTime(Math.max(time - seconds, 0))
            })
        }
    }

    const embedUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&badge=0&dnt=1&autopause=0&controls=0`

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-black relative group select-none"
            onContextMenu={(e) => e.preventDefault()}
            onMouseMove={resetControlsTimer}
            onMouseEnter={resetControlsTimer}
        >
            {/* SCREEN RECORDING PROTECTION - Stays until focus returns */}
            {isBlurred && (
                <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center">
                    <div className="text-center text-white">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                        <p className="text-lg">Video paused</p>
                        <p className="text-gray-400 text-sm mt-2">Return to this window to continue watching</p>
                    </div>
                </div>
            )}

            {/* SCREENSHOT WARNING - Temporary 2s display */}
            {showScreenshotWarning && (
                <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center">
                    <div className="text-center text-white animate-pulse">
                        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h2 className="text-2xl font-bold mb-2">Screen Capture Detected</h2>
                        <p className="text-gray-400">Screenshots are not permitted for this content.</p>
                    </div>
                </div>
            )}

            {/* Watermark */}
            {userEmail && (
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden opacity-15">
                    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-32 -rotate-45 scale-150">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <span key={i} className="text-white text-xs whitespace-nowrap font-mono">
                                {userEmail}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Vimeo iframe */}
            <iframe
                ref={iframeRef}
                src={embedUrl}
                className="w-full h-full absolute inset-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                style={{ pointerEvents: 'none' }}
            />

            {/* Control Overlay */}
            <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={togglePlay}
                onContextMenu={(e) => e.preventDefault()}
            >
                {/* Center Controls */}
                <div className={`absolute inset-0 flex items-center justify-center gap-8 transition-opacity duration-300 ${isPlaying && !showControls ? 'opacity-0' : 'opacity-100'}`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); skipBackward(10) }}
                        className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors relative"
                    >
                        <SkipBack className="w-7 h-7 text-white" />
                        <span className="absolute -bottom-6 text-xs text-white/70">10s</span>
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); togglePlay() }}
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        {isPlaying ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white ml-1" />}
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); skipForward(10) }}
                        className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors relative"
                    >
                        <SkipForward className="w-7 h-7 text-white" />
                        <span className="absolute -bottom-6 text-xs text-white/70">10s</span>
                    </button>
                </div>

                {/* Bottom Controls */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div
                        className="h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer group/progress"
                        onClick={(e) => { e.stopPropagation(); handleSeek(e) }}
                    >
                        <div className="h-full bg-blue-500 rounded-full transition-all relative" style={{ width: `${progress}%` }}>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={(e) => { e.stopPropagation(); togglePlay() }} className="text-white hover:text-blue-400 transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); skipBackward(10) }} className="text-white hover:text-blue-400 transition-colors">
                            <SkipBack className="w-5 h-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); skipForward(10) }} className="text-white hover:text-blue-400 transition-colors">
                            <SkipForward className="w-5 h-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); toggleMute() }} className="text-white hover:text-blue-400 transition-colors">
                            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>
                        <span className="text-white text-sm font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                        <div className="flex-1" />
                        <button onClick={(e) => { e.stopPropagation(); handleFullscreen() }} className="text-white hover:text-blue-400 transition-colors">
                            <Maximize className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
