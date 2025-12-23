'use client'

import { useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface SecurePDFViewerProps {
    url: string
    watermark?: {
        name: string
        email: string
    }
}

export function SecurePDFViewer({ url, watermark }: SecurePDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [scale, setScale] = useState<number>(1.2)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
        setLoading(false)
    }, [])

    const onDocumentLoadError = useCallback((error: Error) => {
        console.error('PDF Load Error:', error)
        setError('Failed to load PDF document')
        setLoading(false)
    }, [])

    const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1))
    const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages))
    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3))
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5))

    // Generate timestamp for watermark
    const timestamp = new Date().toLocaleString()

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-red-500">
                {error}
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 relative select-none">
            {/* Custom Toolbar - No download, no print, no open-in-new-tab */}
            <div className="flex items-center justify-center gap-4 p-3 bg-gray-800 border-b border-gray-700">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={goToPrevPage} 
                    disabled={pageNumber <= 1}
                    className="text-white hover:bg-gray-700"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-white text-sm font-medium min-w-[100px] text-center">
                    Page {pageNumber} of {numPages || '...'}
                </span>
                
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={goToNextPage} 
                    disabled={pageNumber >= numPages}
                    className="text-white hover:bg-gray-700"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-600 mx-2" />

                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={zoomOut}
                    className="text-white hover:bg-gray-700"
                >
                    <ZoomOut className="w-4 h-4" />
                </Button>
                
                <span className="text-white text-xs min-w-[50px] text-center">
                    {Math.round(scale * 100)}%
                </span>
                
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={zoomIn}
                    className="text-white hover:bg-gray-700"
                >
                    <ZoomIn className="w-4 h-4" />
                </Button>
            </div>

            {/* PDF Canvas Area */}
            <div className="flex-1 overflow-auto flex justify-center p-4 relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                )}

                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={null}
                    className="relative"
                >
                    <Page 
                        pageNumber={pageNumber} 
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-2xl"
                    />
                </Document>

                {/* Watermark Overlay */}
                {watermark && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                        <div 
                            className="text-white/10 text-lg font-bold rotate-[-30deg] whitespace-nowrap select-none"
                            style={{ fontSize: '2rem', letterSpacing: '0.5em' }}
                        >
                            {watermark.name} • {watermark.email} • {timestamp}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
