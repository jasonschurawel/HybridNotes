import React, { useState, useRef, useEffect } from 'react'
import { saveAs } from 'file-saver'
import './SaveOptions.css'

// Type declarations for File System Access API
declare global {
  interface Window {
    showSaveFilePicker?: (options?: {
      suggestedName?: string;
      types?: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
      startIn?: string;
    }) => Promise<FileSystemFileHandle>;
  }
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}

interface SaveOptionsProps {
  text: string
  originalFileName: string
  disabled?: boolean
  onFileSaved?: () => void // Callback when file is saved
}

const SaveOptions: React.FC<SaveOptionsProps> = ({
  text,
  originalFileName,
  disabled = false,
  onFileSaved
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const getBaseFileName = (fileName: string) => {
    return fileName.replace(/\.pdf$/i, '')
  }

  // Enhanced save function with File System Access API support
  const saveFileAdvanced = async (content: string, filename: string, mimeType: string) => {
    try {
      // Check if File System Access API is supported
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker!({
          suggestedName: filename,
          types: [{
            description: 'Text files',
            accept: {
              [mimeType]: [`.${filename.split('.').pop()}`]
            }
          }]
        })
        
        const writable = await fileHandle.createWritable()
        await writable.write(content)
        await writable.close()
        
        setLastSaved(filename)
        return true
      } else {
        // Fallback to regular download
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
        saveAs(blob, filename)
        setLastSaved(filename)
        return true
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to save file:', error)
        // Fallback to regular download on error
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
        saveAs(blob, filename)
        setLastSaved(filename)
      }
      return false
    }
  }

  const saveOptions = [
    {
      id: 'txt',
      label: 'Save as .txt',
      icon: '📄',
      description: 'Plain text format',
      action: async () => {
        const baseFileName = getBaseFileName(originalFileName)
        const success = await saveFileAdvanced(text, `${baseFileName}_improved.txt`, 'text/plain')
        if (success && onFileSaved) {
          onFileSaved()
        }
      }
    },
    {
      id: 'md',
      label: 'Save as .md',
      icon: '📝',
      description: 'Markdown format',
      action: async () => {
        const baseFileName = getBaseFileName(originalFileName)
        const success = await saveFileAdvanced(text, `${baseFileName}.md`, 'text/markdown')
        if (success && onFileSaved) {
          onFileSaved()
        }
      }
    },
    {
      id: 'copy',
      label: 'Copy to clipboard',
      icon: '📋',
      description: 'Copy enhanced text',
      action: async () => {
        try {
          await navigator.clipboard.writeText(text)
          setLastSaved('Copied to clipboard')
          setTimeout(() => setLastSaved(null), 3000)
        } catch (error) {
          console.error('Failed to copy to clipboard:', error)
        }
      }
    }
  ]

  const handleMainAction = async () => {
    // Default action is save as .md
    await saveOptions[1].action()
  }

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleOptionSelect = async (option: typeof saveOptions[0]) => {
    await option.action()
    setIsMenuOpen(false)
  }

  if (!text || text.trim().length === 0) {
    return null
  }

  return (
    <div className="save-options" ref={menuRef}>
      {lastSaved && (
        <div className="save-notification">
          ✅ {lastSaved}
        </div>
      )}
      
      <div className="split-button" role="group" aria-label="Save options">
        <button
          className="md-button md-button-filled split-button-main"
          onClick={handleMainAction}
          disabled={disabled}
          title="Save at same location as PDF"
        >
          <span className="button-icon">🔄</span>
          <span className="button-text">Mirror PDF</span>
        </button>
        
        <button
          className="md-button md-button-filled split-button-dropdown"
          onClick={handleMenuToggle}
          disabled={disabled}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          title="More save options"
        >
          <span className="dropdown-icon">▼</span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="save-menu" role="menu">
          {saveOptions.map((option) => (
            <button
              key={option.id}
              className="save-menu-item"
              onClick={() => handleOptionSelect(option)}
              disabled={disabled}
              role="menuitem"
            >
              <span className="menu-item-icon">{option.icon}</span>
              <div className="menu-item-content">
                <span className="menu-item-label">{option.label}</span>
                <span className="menu-item-description">{option.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SaveOptions
