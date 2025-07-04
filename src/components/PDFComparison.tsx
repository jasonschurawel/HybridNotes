import React, { useState, useEffect } from 'react'
import PDFViewer from './PDFViewer'
import TextPreview from './TextPreview'
import { extractTextFromPDF } from '../services/pdfService'
import './PDFComparison.css'

interface PDFComparisonProps {
  file: File
  improvedText: string
  fileName: string
  onExtractedTextChange?: (text: string) => void
}

const PDFComparison: React.FC<PDFComparisonProps> = ({ 
  file, 
  improvedText, 
  fileName,
  onExtractedTextChange 
}) => {
  const [extractedText, setExtractedText] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'side-by-side' | 'stacked'>('side-by-side')

  useEffect(() => {
    const extractText = async () => {
      try {
        setLoading(true)
        setError(null)
        const text = await extractTextFromPDF(file)
        setExtractedText(text)
        if (onExtractedTextChange) {
          onExtractedTextChange(text)
        }
      } catch (err: unknown) {
        console.error('Error extracting text:', err)
        if (err instanceof Error) {
          setError(err.message || 'Failed to extract text from PDF')
        } else {
          setError('Failed to extract text from PDF')
        }
      } finally {
        setLoading(false)
      }
    }

    extractText()
  }, [file, onExtractedTextChange])

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'side-by-side' ? 'stacked' : 'side-by-side')
  }

  if (loading) {
    return (
      <div className="pdf-comparison">
        <div className="comparison-loading">
          <div className="loading-spinner">📄</div>
          <p>Extracting text from PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pdf-comparison">
        <div className="comparison-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pdf-comparison">
      <div className="comparison-header">
        <h3>📊 PDF vs Enhanced Notes Comparison</h3>
        <div className="view-controls">
          <button 
            onClick={toggleViewMode}
            className="view-toggle-button"
            title={`Switch to ${viewMode === 'side-by-side' ? 'stacked' : 'side-by-side'} view`}
          >
            {viewMode === 'side-by-side' ? '📱 Stack View' : '🔄 Side View'}
          </button>
        </div>
      </div>
      
      <div className={`comparison-content ${viewMode}`}>
        <div className="comparison-panel pdf-panel">
          <div className="panel-header">
            <h4>📄 Original PDF</h4>
            <span className="panel-subtitle">{fileName}</span>
          </div>
          <div className="panel-content">
            <PDFViewer file={file} className="comparison-pdf-viewer" />
          </div>
        </div>
        
        <div className="comparison-divider"></div>
        
        <div className="comparison-panel text-panel">
          <div className="panel-header">
            <h4>📝 Extracted Text</h4>
            <span className="panel-subtitle">Original transcription</span>
          </div>
          <div className="panel-content">
            <TextPreview 
              text={extractedText}
              placeholder="Extracted text will appear here..."
              className="comparison-text-preview"
            />
          </div>
        </div>
        
        {improvedText && (
          <>
            <div className="comparison-divider"></div>
            <div className="comparison-panel improved-panel">
              <div className="panel-header">
                <h4>✨ Enhanced Notes</h4>
                <span className="panel-subtitle">Cleaned & structured version</span>
              </div>
              <div className="panel-content">
                <TextPreview 
                  text={improvedText}
                  placeholder="Enhanced text will appear here..."
                  className="comparison-text-preview improved"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PDFComparison
