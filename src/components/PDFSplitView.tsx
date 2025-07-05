import React, { useState, useEffect, useRef } from 'react'
import PDFViewer from './PDFViewer'
import SaveOptions from './SaveOptions'
import type { Language } from '../services/geminiService'
import './PDFSplitView.css'

interface PDFSplitViewProps {
  file: File
  enhancedText: string
  originalText: string
  fileName: string
  onTextChange: (text: string) => void
  disabled?: boolean
  onFileSaved?: (savedFileName: string) => void
  proposedIteration?: { newText: string; changes: string[] } | null
  onIterationAccepted?: () => void
  onIterationRejected?: () => void
  selectedLanguage?: Language // Add language prop
}

// Language mapping for HTML spellcheck attribute
const languageToSpellCheckCode: Record<Language, string> = {
  english: 'en',
  german: 'de',
  french: 'fr',
  spanish: 'es',
  italian: 'it',
  portuguese: 'pt',
  dutch: 'nl',
  polish: 'pl',
  czech: 'cs',
  slovak: 'sk',
  hungarian: 'hu',
  romanian: 'ro',
  bulgarian: 'bg',
  croatian: 'hr',
  serbian: 'sr',
  slovenian: 'sl',
  estonian: 'et',
  latvian: 'lv',
  lithuanian: 'lt'
}

const PDFSplitView: React.FC<PDFSplitViewProps> = ({ 
  file, 
  enhancedText, 
  originalText,
  fileName,
  onTextChange,
  disabled = false,
  onFileSaved,
  proposedIteration,
  onIterationAccepted,
  onIterationRejected,
  selectedLanguage = 'english' // Default to English
}) => {
  const [editableText, setEditableText] = useState(enhancedText)
  const [currentView, setCurrentView] = useState<'original' | 'enhanced' | 'diff'>('enhanced')
  const [displayMode, setDisplayMode] = useState<'raw' | 'markdown'>('markdown')
  const [isIterationCollapsed, setIsIterationCollapsed] = useState(true) // Start collapsed by default
  const enhancedTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Update editable text when enhanced text changes
  useEffect(() => {
    setEditableText(enhancedText)
  }, [enhancedText])

  // Update editable text when proposed iteration changes
  useEffect(() => {
    if (proposedIteration) {
      setEditableText(proposedIteration.newText)
    }
  }, [proposedIteration])

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

  const handleViewSwitch = (view: 'original' | 'enhanced' | 'diff') => {
    setCurrentView(view)
  }

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

  const handleAcceptIteration = () => {
    if (proposedIteration && onIterationAccepted) {
      setEditableText(proposedIteration.newText)
      onTextChange(proposedIteration.newText)
      onIterationAccepted()
      
      // Add visual feedback class
      if (enhancedTextareaRef.current) {
        enhancedTextareaRef.current.classList.add('applied-changes')
        setTimeout(() => {
          if (enhancedTextareaRef.current) {
            enhancedTextareaRef.current.classList.remove('applied-changes')
          }
        }, 1500)
      }
      
      // Enhanced auto-scroll to top after applying changes
      // Use a shorter timeout for more immediate response
      setTimeout(() => {
        // Scroll the textarea to top first (most important)
        if (enhancedTextareaRef.current) {
          enhancedTextareaRef.current.scrollTop = 0
          // Focus the textarea briefly to draw attention to the changes
          enhancedTextareaRef.current.focus()
          setTimeout(() => {
            if (enhancedTextareaRef.current) {
              enhancedTextareaRef.current.blur()
            }
          }, 100)
        }
        
        // Scroll any parent containers that might be scrollable
        const mainContent = document.querySelector('.main-content.review')
        if (mainContent) {
          mainContent.scrollTop = 0
        }
        
        // Scroll the PDF split view container
        const pdfSplitView = document.querySelector('.pdf-split-view')
        if (pdfSplitView) {
          pdfSplitView.scrollTop = 0
        }
        
        // Scroll the page to top with smooth behavior
        window.scrollTo({ top: 0, behavior: 'smooth' })
        
        // Also scroll any overflow containers
        const textPanel = document.querySelector('.text-panel .panel-content')
        if (textPanel) {
          textPanel.scrollTop = 0
        }
      }, 50)
    }
  }

  const handleRejectIteration = () => {
    if (onIterationRejected) {
      onIterationRejected()
      // Don't force view mode to 'enhanced' here to allow user's previous selection to persist
    }
  }

  const toggleIterationCollapse = () => {
    setIsIterationCollapsed(!isIterationCollapsed)
  }

  const toggleDisplayMode = () => {
    setDisplayMode(displayMode === 'raw' ? 'markdown' : 'raw')
  }

  // Simple markdown renderer
  const renderMarkdown = (text: string) => {
    if (!text) return ''
    
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      
      // Lists - handle unordered lists
      .replace(/^[\s]*[-*+] (.+$)/gm, '<li>$1</li>')
      
      // Lists - handle ordered lists
      .replace(/^[\s]*\d+\. (.+$)/gm, '<li class="ordered">$1</li>')
      
      // Wrap consecutive list items in ul/ol tags
      .replace(/((<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>')
      .replace(/((<li class="ordered">.*?<\/li>\s*)+)/g, (match) => {
        return '<ol>' + match.replace(/class="ordered"/g, '') + '</ol>'
      })
      
      // Paragraphs - split by double newlines
      .split('\n\n')
      .map(paragraph => {
        paragraph = paragraph.trim()
        if (!paragraph) return ''
        
        // Skip if already wrapped in HTML tags
        if (paragraph.startsWith('<') && paragraph.endsWith('>')) {
          return paragraph
        }
        
        // Replace single newlines with breaks within paragraphs
        paragraph = paragraph.replace(/\n/g, '<br>')
        
        return `<p>${paragraph}</p>`
      })
      .join('')
  }

  // This function is no longer used as we're using the view mode selector instead
  // Kept for reference in case we need to reimplement it
  // const toggleDiffView = () => {
  //   setShowDiff(!showDiff)
  //   setViewMode(showDiff ? 'enhanced' : 'diff')
  // }

  return (
    <div className="pdf-split-view">
      <div className="split-view-header">
        <h3>📊 PDF & Enhanced Notes</h3>
        <SaveOptions
          text={editableText}
          originalFileName={fileName}
          disabled={disabled}
          onFileSaved={onFileSaved}
          markdownContent={renderMarkdown(editableText)}
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
              <div className="view-mode-selector">
                <button
                  className={`view-mode-btn ${currentView === 'original' ? 'active' : ''}`}
                  onClick={() => handleViewSwitch('original')}
                >
                  📄 Original
                </button>
                <button
                  className={`view-mode-btn ${currentView === 'enhanced' ? 'active' : ''}`}
                  onClick={() => handleViewSwitch('enhanced')}
                >
                  ✨ Enhanced
                </button>
                <button
                  className={`view-mode-btn ${currentView === 'diff' ? 'active' : ''}`}
                  onClick={() => handleViewSwitch('diff')}
                >
                  🔍 Diff
                </button>
              </div>
              <button 
                className={`display-mode-toggle ${displayMode === 'markdown' ? 'active' : ''}`}
                onClick={toggleDisplayMode}
                title={`Switch to ${displayMode === 'raw' ? 'markdown' : 'raw'} view`}
                disabled={disabled || currentView !== 'enhanced'}
              >
                {displayMode === 'raw' ? '🎨 Markdown' : '📝 Raw'}
              </button>
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
            <div className={`iteration-proposal ${isIterationCollapsed ? 'collapsed' : 'expanded'}`}>
              <div className="proposal-header">
                <div className="proposal-info">
                  <h5>💡 Applied Edits</h5>
                  <p>{proposedIteration.changes.length} changes proposed</p>
                </div>
                <div className="proposal-actions">
                  <button 
                    className="collapse-btn"
                    onClick={toggleIterationCollapse}
                    title={isIterationCollapsed ? "Expand edits" : "Collapse edits"}
                  >
                    {isIterationCollapsed ? '▼' : '▲'}
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

              {!isIterationCollapsed && (
                <div className="changes-summary">
                  <h6>📋 Summary of Changes:</h6>
                  <ul>
                    {proposedIteration.changes.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="panel-content">
            {currentView === 'original' && (
              <textarea
                className="enhanced-text-editor original-text"
                value={originalText}
                readOnly
                placeholder="Original text from PDF..."
                spellCheck={false}
              />
            )}
            
            {currentView === 'enhanced' && (
              <>
                {displayMode === 'raw' ? (
                  <div className="raw-editor-container">
                    <textarea
                      ref={enhancedTextareaRef}
                      className="enhanced-text-editor"
                      value={editableText}
                      onChange={handleTextChange}
                      placeholder="Enhanced text will appear here..."
                      disabled={disabled}
                      spellCheck={true}
                      lang={languageToSpellCheckCode[selectedLanguage]} // Set spellcheck language
                    />
                    <div className="text-stats-badges">
                      <span className="stat-badge">📝 {getCharCount().toLocaleString()} chars</span>
                      <span className="stat-badge">🔤 {getWordCount().toLocaleString()} words</span>
                    </div>
                  </div>
                ) : (
                  <div className="markdown-preview-container">
                    <div 
                      className="markdown-preview-readonly"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(editableText) }}
                    />
                    <button 
                      className="edit-btn"
                      onClick={toggleDisplayMode}
                      title="Edit text"
                      disabled={disabled}
                    >
                      ✏️ Edit
                    </button>
                    <div className="text-stats-badges">
                      <span className="stat-badge">📝 {getCharCount().toLocaleString()} chars</span>
                      <span className="stat-badge">🔤 {getWordCount().toLocaleString()} words</span>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {currentView === 'diff' && (
              <div className="diff-view-container">
                <div className="diff-view">
                  {createSimpleDiff(originalText, proposedIteration ? proposedIteration.newText : editableText).map((diffItem, index) => (
                    <div key={index} className={`diff-line diff-${diffItem.type}`}>
                      <span className="line-number">{diffItem.lineNum}</span>
                      <div className="diff-content">
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
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFSplitView
