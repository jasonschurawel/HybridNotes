import React from 'react'
import './TextPreview.css'

interface TextPreviewProps {
  text: string
  placeholder?: string
}

const TextPreview: React.FC<TextPreviewProps> = ({ 
  text, 
  placeholder = "Text will appear here..." 
}) => {
  const formatText = (rawText: string) => {
    // Basic formatting for better readability
    return rawText
      .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
      .trim()
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      alert('Text copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy text:', error)
      alert('Failed to copy text to clipboard')
    }
  }

  return (
    <div className="text-preview">
      <div className="preview-header">
        <div className="text-stats">
          {text && (
            <>
              <span className="stat">
                📝 {text.length.toLocaleString()} characters
              </span>
              <span className="stat">
                📄 ~{Math.ceil(text.split(/\s+/).length / 250)} pages
              </span>
              <span className="stat">
                🔤 {text.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()} words
              </span>
            </>
          )}
        </div>
        {text && (
          <button 
            className="copy-button"
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            📋 Copy
          </button>
        )}
      </div>
      
      <div className="preview-content">
        {text ? (
          <pre className="text-content">
            {formatText(text)}
          </pre>
        ) : (
          <div className="placeholder">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}

export default TextPreview
