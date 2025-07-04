import React, { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import type { RenderTask } from 'pdfjs-dist/types/src/display/api'
import './PDFViewer.css'

// Use local worker file - no external dependencies
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

interface PDFViewerProps {
  file: File
  className?: string
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [scale, setScale] = useState(1.2)
  const renderTaskRef = useRef<RenderTask | null>(null)

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Loading PDF file:', file.name, 'Size:', file.size)
        
        const arrayBuffer = await file.arrayBuffer()
        console.log('PDF ArrayBuffer loaded, size:', arrayBuffer.byteLength)
        
        // Configure for offline use - no worker, no external dependencies
        const loadPromise = pdfjsLib.getDocument({ 
          data: arrayBuffer,
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: true,
          disableFontFace: false,
          verbosity: 0 // Reduce logging
        }).promise
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF loading timeout after 30 seconds')), 30000)
        )
        
        const pdfDoc = await Promise.race([loadPromise, timeoutPromise]) as pdfjsLib.PDFDocumentProxy
        
        console.log('PDF Document loaded, pages:', pdfDoc.numPages)
        
        setPdf(pdfDoc)
        setTotalPages(pdfDoc.numPages)
        setCurrentPage(1)
      } catch (err: unknown) {
        console.error('Error loading PDF:', err)
        if (err instanceof Error) {
          console.error('Error details:', {
            name: err.name,
            message: err.message,
            stack: err.stack
          })
          setError(`Failed to load PDF: ${err.message}`)
        } else {
          setError('Failed to load PDF')
        }
      } finally {
        setLoading(false)
      }
    }

    loadPDF()
  }, [file])

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return

      // Cancel any previous render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }

      try {
        console.log('Rendering page:', currentPage)
        const page = await pdf.getPage(currentPage)
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')!
        
        // Clear the canvas before rendering
        context.clearRect(0, 0, canvas.width, canvas.height)
        
        const viewport = page.getViewport({ scale })
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        // Store the render task so we can cancel it if needed
        renderTaskRef.current = page.render(renderContext)
        await renderTaskRef.current.promise
        
        renderTaskRef.current = null
        console.log('Page rendered successfully:', currentPage)
      } catch (err: unknown) {
        // Don't log errors if the render was cancelled
        if (err instanceof Error && err.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err)
          console.error('Render error details:', {
            name: err.name,
            message: err.message,
            currentPage,
            totalPages
          })
          setError(`Failed to render PDF page ${currentPage}: ${err.message}`)
        }
      }
    }

    renderPage()

    // Cleanup function to cancel render task on unmount or dependency change
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
    }
  }, [pdf, currentPage, scale, totalPages])

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  const resetZoom = () => {
    setScale(1.2)
  }

  if (loading) {
    return (
      <div className={`pdf-viewer ${className}`}>
        <div className="pdf-loading">
          <div className="loading-spinner">📄</div>
          <p>Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`pdf-viewer ${className}`}>
        <div className="pdf-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`pdf-viewer ${className}`}>
      <div className="pdf-controls">
        <div className="navigation-controls">
          <button 
            onClick={goToPreviousPage} 
            disabled={currentPage <= 1}
            className="nav-button"
            title="Previous page"
          >
            ⬅️
          </button>
          <span className="page-info">
            {currentPage} / {totalPages}
          </span>
          <button 
            onClick={goToNextPage} 
            disabled={currentPage >= totalPages}
            className="nav-button"
            title="Next page"
          >
            ➡️
          </button>
        </div>
        
        <div className="zoom-controls">
          <button onClick={zoomOut} className="zoom-button" title="Zoom out">
            🔍-
          </button>
          <button onClick={resetZoom} className="zoom-button" title="Reset zoom">
            {Math.round(scale * 100)}%
          </button>
          <button onClick={zoomIn} className="zoom-button" title="Zoom in">
            🔍+
          </button>
        </div>
      </div>
      
      <div className="pdf-content">
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>
    </div>
  )
}

export default PDFViewer
