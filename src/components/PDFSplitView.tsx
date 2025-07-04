import React, { useState } from 'react'
import PDFViewer from './PDFViewer'
import SaveOptions from './SaveOptions'
import './PDFSplitView.css'

interface PDFSplitViewProps {
  file: File
  enhancedText: string
  fileName: string
  onTextChange: (text: string) => void
  disabled?: boolean
}

const PDFSplitView: React.FC<PDFSplitViewProps> = ({ 
  file, 
  enhancedText, 
  fileName,
  onTextChange,
  disabled = false
}) => {
  const [editableText, setEditableText] = useState(enhancedText)

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value
    setEditableText(newText)
    onTextChange(newText)
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableText)
      alert('Text copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy text:', error)
      alert('Failed to copy text to clipboard')
    }
  }

  const getWordCount = () => {
    return editableText.split(/\s+/).filter(word => word.length > 0).length
  }

  const getCharCount = () => {
    return editableText.length
  }

  return (
    <div className="pdf-split-view">
      <div className="split-view-header">
        <h3>📊 PDF & Enhanced Notes</h3>
        <SaveOptions
          text={editableText}
          originalFileName={fileName}
          disabled={disabled}
        />
      </div>
      
      <div className="split-view-content">
        <div className="pdf-panel">
          <div className="panel-header">
            <h4>📄 Original PDF</h4>
            <span className="panel-subtitle">{fileName}</span>
          </div>
          <div className="panel-content">
            <PDFViewer file={file} className="split-pdf-viewer" />
          </div>
        </div>
        
        <div className="text-panel">
          <div className="panel-header">
            <h4>✨ Enhanced Notes</h4>
            <div className="text-controls">
              <div className="text-stats">
                <span className="stat">📝 {getCharCount().toLocaleString()} chars</span>
                <span className="stat">🔤 {getWordCount().toLocaleString()} words</span>
              </div>
              <button 
                className="copy-button"
                onClick={handleCopyToClipboard}
                title="Copy to clipboard"
                disabled={disabled}
              >
                📋 Copy
              </button>
            </div>
          </div>
          <div className="panel-content">
            <textarea
              className="enhanced-text-editor"
              value={editableText}
              onChange={handleTextChange}
              placeholder="Enhanced text will appear here..."
              disabled={disabled}
              spellCheck={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFSplitView
