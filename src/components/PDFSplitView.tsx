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
  onFileSaved?: (savedFileName: string) => void // Add callback for when file is saved with filename
  proposedIteration?: { newText: string; changes: string[] } | null
  onIterationAccepted?: () => void
  onIterationRejected?: () => void
}

const PDFSplitView: React.FC<PDFSplitViewProps> = ({ 
  file, 
  enhancedText, 
  fileName,
  onTextChange,
  disabled = false,
  onFileSaved,
  proposedIteration,
  onIterationAccepted,
  onIterationRejected
}) => {
  const [editableText, setEditableText] = useState(enhancedText)
  const [showDiff, setShowDiff] = useState(false)

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

  // Simple diff function to highlight changes
  const createSimpleDiff = (originalText: string, newText: string) => {
    const originalLines = originalText.split('\n')
    const newLines = newText.split('\n')
    const maxLines = Math.max(originalLines.length, newLines.length)
    
    const diff = []
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || ''
      const newLine = newLines[i] || ''
      
      if (originalLine !== newLine) {
        if (originalLine && newLine) {
          diff.push({ type: 'changed', original: originalLine, new: newLine, lineNum: i + 1 })
        } else if (originalLine) {
          diff.push({ type: 'removed', original: originalLine, new: '', lineNum: i + 1 })
        } else {
          diff.push({ type: 'added', original: '', new: newLine, lineNum: i + 1 })
        }
      }
    }
    return diff
  }

  const handleAcceptIteration = () => {
    if (proposedIteration && onIterationAccepted) {
      setEditableText(proposedIteration.newText)
      onTextChange(proposedIteration.newText)
      onIterationAccepted()
      setShowDiff(false)
    }
  }

  const handleRejectIteration = () => {
    if (onIterationRejected) {
      onIterationRejected()
      setShowDiff(false)
    }
  }

  const toggleDiffView = () => {
    setShowDiff(!showDiff)
  }

  return (
    <div className="pdf-split-view">
      <div className="split-view-header">
        <h3>📊 PDF & Enhanced Notes</h3>
        <SaveOptions
          text={editableText}
          originalFileName={fileName}
          disabled={disabled}
          onFileSaved={onFileSaved}
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

          {proposedIteration && (
            <div className="iteration-proposal">
              <div className="proposal-header">
                <div className="proposal-info">
                  <h5>💡 AI Suggested Improvements</h5>
                  <p>{proposedIteration.changes.length} changes proposed</p>
                </div>
                <div className="proposal-actions">
                  <button 
                    className="diff-toggle"
                    onClick={toggleDiffView}
                  >
                    {showDiff ? '📝 Show Text' : '🔍 Show Diff'}
                  </button>
                  <button 
                    className="accept-btn"
                    onClick={handleAcceptIteration}
                  >
                    ✅ Accept
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={handleRejectIteration}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>

              <div className="changes-summary">
                <h6>📋 Summary of Changes:</h6>
                <ul>
                  {proposedIteration.changes.map((change, index) => (
                    <li key={index}>{change}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="panel-content">
            {proposedIteration && showDiff ? (
              <div className="diff-view">
                {createSimpleDiff(editableText, proposedIteration.newText).map((diffItem, index) => (
                  <div key={index} className={`diff-line diff-${diffItem.type}`}>
                    <span className="line-number">{diffItem.lineNum}</span>
                    {diffItem.type === 'changed' && (
                      <>
                        <div className="diff-removed">- {diffItem.original}</div>
                        <div className="diff-added">+ {diffItem.new}</div>
                      </>
                    )}
                    {diffItem.type === 'removed' && (
                      <div className="diff-removed">- {diffItem.original}</div>
                    )}
                    {diffItem.type === 'added' && (
                      <div className="diff-added">+ {diffItem.new}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <textarea
                className="enhanced-text-editor"
                value={proposedIteration && !showDiff ? proposedIteration.newText : editableText}
                onChange={handleTextChange}
                placeholder="Enhanced text will appear here..."
                disabled={disabled || (proposedIteration && !showDiff)}
                spellCheck={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFSplitView
