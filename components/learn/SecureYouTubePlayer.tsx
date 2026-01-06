'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack, AlertTriangle } from 'lucide-react'

interface SecureYouTubePlayerProps {
    videoId: string
    userEmail?: string
}

// Check for existing YT API
declare global {
    interface Window {
        YT: any
        onYouTubeIframeAPIReady: () => void
    }
}

export function SecureYouTubePlayer({ videoId, userEmail }: SecureYouTubePlayerProps) {
    const iframeRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showControls, setShowControls] = useState(true)

    // Protection states
    const [isBlurred, setIsBlurred] = useState(false)
    const [showScreenshotWarning, setShowScreenshotWarning] = useState(false)

    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)
    const progressInterval = useRef<NodeJS.Timeout | null>(null)

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // --- SECURITY PROTECTIONS (Mirrored from Vimeo) ---
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurred(true)
                if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
                    playerRef.current.pauseVideo()
                }
            } else {
                setIsBlurred(false)
            }
        }

        const handleBlur = () => {
            setIsBlurred(true)
            if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
                playerRef.current.pauseVideo()
            }
        }

        const handleFocus = () => {
            setIsBlurred(false)
        }

        const showTemporaryWarning = () => {
            setShowScreenshotWarning(true)
            setTimeout(() => setShowScreenshotWarning(false), 2000)
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'PrintScreen' ||
                (e.metaKey && e.shiftKey && ['s', '3', '4', '5'].includes(e.key.toLowerCase()))) {
                e.preventDefault()
                showTemporaryWarning()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('blur', handleBlur)
        window.addEventListener('focus', handleFocus)
        document.addEventListener('keydown', handleKeyDown, true)
        document.addEventListener('keyup', handleKeyDown, true)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('blur', handleBlur)
            window.removeEventListener('focus', handleFocus)
            document.removeEventListener('keydown', handleKeyDown, true)
            document.removeEventListener('keyup', handleKeyDown, true)
        }
    }, [])

    // --- YOUTUBE SDK ---
    useEffect(() => {
        const initPlayer = () => {
            if (!iframeRef.current) return

            // Ensure previous instance is destroyed if needed (React Strict Mode safety)
            // But usually we rely on the div ref being fresh.

            playerRef.current = new window.YT.Player(iframeRef.current, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 0, // Disable native controls
                    disablekb: 1, // Disable native keyboard controls
                    enablejsapi: 1,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3 // Hide annotations
                },
                events: {
                    onReady: (event: any) => {
                        setDuration(event.target.getDuration())
                        setIsMuted(event.target.isMuted())
                    },
                    onStateChange: (event: any) => {
                        // 1 = Playing, 2 = Paused, 0 = Ended
                        if (event.data === 1) {
                            setIsPlaying(true)
                            startProgressTracking()
                        } else {
                            setIsPlaying(false)
                            stopProgressTracking()
                        }
                    }
                }
            })
        }

        if (!window.YT) {
            const tag = document.createElement('script')
            tag.src = 'https://www.youtube.com/iframe_api'
            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

            window.onYouTubeIframeAPIReady = () => {
                initPlayer()
            }
        } else {
            initPlayer()
        }

        return () => {
            stopProgressTracking()
            // Important: We don't necessarily destroy the player here as React re-renders might kill the dom node first
        }
    }, [videoId])

    const startProgressTracking = () => {
        if (progressInterval.current) clearInterval(progressInterval.current)
        progressInterval.current = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                const time = playerRef.current.getCurrentTime()
                const dur = playerRef.current.getDuration()
                setCurrentTime(time)
                setDuration(dur)
                if (dur > 0) setProgress((time / dur) * 100)
            }
        }, 1000)
    }

    const stopProgressTracking = () => {
        if (progressInterval.current) clearInterval(progressInterval.current)
    }

    // --- CONTROLS ---
    const resetControlsTimer = useCallback(() => {
        setShowControls(true)
        if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
        if (isPlaying) {
            hideControlsTimeout.current = setTimeout(() => setShowControls(false), 3000)
        }
    }, [isPlaying])

    useEffect(() => {
        resetControlsTimer()
    }, [isPlaying, resetControlsTimer])

    const togglePlay = () => {
        if (playerRef.current) {
            if (isPlaying) playerRef.current.pauseVideo()
            else playerRef.current.playVideo()
        }
    }

    const toggleMute = () => {
        if (playerRef.current) {
            const newMuteState = !isMuted
            if (newMuteState) playerRef.current.mute()
            else playerRef.current.unMute()
            setIsMuted(newMuteState)
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
            const seekTo = percent * duration
            playerRef.current.seekTo(seekTo, true)
            setProgress(percent * 100)
            setCurrentTime(seekTo)
        }
    }

    const skipForward = (seconds: number) => {
        if (playerRef.current) {
            const time = playerRef.current.getCurrentTime()
            playerRef.current.seekTo(Math.min(time + seconds, duration), true)
        }
    }

    const skipBackward = (seconds: number) => {
        if (playerRef.current) {
            const time = playerRef.current.getCurrentTime()
            playerRef.current.seekTo(Math.max(time - seconds, 0), true)
        }
    }

    // Reuse exact same UI structure as Vimeo
    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-black relative group select-none"
            onContextMenu={(e) => e.preventDefault()}
            onMouseMove={resetControlsTimer}
            onMouseEnter={resetControlsTimer}
        >
            {/* SCREEN RECORDING PROTECTION */}
            {isBlurred && (
                <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center">
                    <div className="text-center text-white">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                        <p className="text-lg">Video paused</p>
                        <p className="text-gray-400 text-sm mt-2">Return to this window to continue watching</p>
                    </div>
                </div>
            )}

            {/* SCREENSHOT WARNING */}
            {showScreenshotWarning && (
                <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center">
                    <div className="text-center text-white animate-pulse">
                        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h2 className="text-2xl font-bold mb-2">Screen Capture Detected</h2>
                        <p className="text-gray-400">Screenshots are not permitted for this content.</p>
                    </div>
                </div>
            )}



            {/* YOUTUBE IFRAME CONTAINER */}
            <div className="w-full h-full absolute inset-0 pointer-events-none">
                <div ref={iframeRef} className="w-full h-full" />
            </div>

            {/* TRANSPARENT BLOCKER LAYER - Ensures clicks hit our controls, not iframe */}
            <div className="absolute inset-0 z-0 bg-transparent" />

            {/* CONTROL OVERLAY */}
            <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={togglePlay}
                onContextMenu={(e) => e.preventDefault()}
            >
                {/* Center Controls */}
                <div className={`absolute inset-0 flex items-center justify-center gap-8 transition-opacity duration-300 ${isPlaying && !showControls ? 'opacity-0' : 'opacity-100'}`}>
                    <button onClick={(e) => { e.stopPropagation(); skipBackward(10) }} className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                        <SkipBack className="w-7 h-7 text-white" /><span className="absolute -bottom-6 text-xs text-white/70">10s</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); togglePlay() }} className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                        {isPlaying ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white ml-1" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); skipForward(10) }} className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                        <SkipForward className="w-7 h-7 text-white" /><span className="absolute -bottom-6 text-xs text-white/70">10s</span>
                    </button>
                </div>

                {/* Bottom Controls */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer group/progress" onClick={(e) => { e.stopPropagation(); handleSeek(e) }}>
                        <div className="h-full bg-red-600 rounded-full transition-all relative" style={{ width: `${progress}%` }}>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={(e) => { e.stopPropagation(); togglePlay() }} className="text-white hover:text-red-500 transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); skipBackward(10) }} className="text-white hover:text-red-500 transition-colors">
                            <SkipBack className="w-5 h-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); skipForward(10) }} className="text-white hover:text-red-500 transition-colors">
                            <SkipForward className="w-5 h-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); toggleMute() }} className="text-white hover:text-red-500 transition-colors">
                            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>
                        <span className="text-white text-sm font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                        <div className="flex-1" />
                        <button onClick={(e) => { e.stopPropagation(); handleFullscreen() }} className="text-white hover:text-red-500 transition-colors">
                            <Maximize className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
