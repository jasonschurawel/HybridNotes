import React, { useState, useRef, useEffect } from 'react'
import { saveAs } from 'file-saver'
import './SaveOptions.css'

interface SaveOptionsProps {
  text: string
  originalFileName: string
  disabled?: boolean
}

const SaveOptions: React.FC<SaveOptionsProps> = ({
  text,
  originalFileName,
  disabled = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  const saveOptions = [
    {
      id: 'txt',
      label: 'Save as .txt',
      icon: '📄',
      description: 'Plain text format',
      action: () => {
        const baseFileName = getBaseFileName(originalFileName)
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
        saveAs(blob, `${baseFileName}_improved.txt`)
      }
    },
    {
      id: 'md',
      label: 'Save as .md',
      icon: '📝',
      description: 'Markdown format',
      action: () => {
        const baseFileName = getBaseFileName(originalFileName)
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
        saveAs(blob, `${baseFileName}_improved.md`)
      }
    },
    {
      id: 'mirror',
      label: 'Mirror .pdf with .md',
      icon: '🔄',
      description: 'Same name as PDF',
      action: () => {
        const baseFileName = getBaseFileName(originalFileName)
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
        saveAs(blob, `${baseFileName}.md`)
      }
    }
  ]

  const handleMainAction = () => {
    // Default action is save as .md
    saveOptions[1].action()
  }

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleOptionSelect = (option: typeof saveOptions[0]) => {
    option.action()
    setIsMenuOpen(false)
  }

  if (!text || text.trim().length === 0) {
    return null
  }

  return (
    <div className="save-options" ref={menuRef}>
      <div className="split-button" role="group" aria-label="Save options">
        <button
          className="md-button md-button-filled split-button-main"
          onClick={handleMainAction}
          disabled={disabled}
          title="Save as Markdown file"
        >
          <span className="button-icon">📝</span>
          <span className="button-text">Save as .md</span>
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
