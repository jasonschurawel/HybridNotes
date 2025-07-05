import React, { useState, useRef, useEffect } from 'react'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
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
  onFileSaved?: (savedFileName: string) => void // Callback when file is saved with filename
  markdownContent?: string // Optional: pre-rendered markdown HTML content for PDF generation
}

const SaveOptions: React.FC<SaveOptionsProps> = ({
  text,
  originalFileName,
  disabled = false,
  onFileSaved,
  markdownContent
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

  // Function to render markdown content to HTML for PDF generation
  const renderMarkdownToHTML = (text: string) => {
    if (!text) return ''
    
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 style="color: #1976d2; font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.75rem 0;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="color: #1976d2; font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0 1rem 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.25rem;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="color: #1976d2; font-size: 1.75rem; font-weight: 600; margin: 0 0 1rem 0; border-bottom: 2px solid #1976d2; padding-bottom: 0.5rem;">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #1976d2;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #424242;">$1</em>')
      
      // Code
      .replace(/`(.*?)`/g, '<code style="background-color: #f5f5f5; color: #333; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.875rem;">$1</code>')
      
      // Lists - handle unordered lists
      .replace(/^[\s]*[-*+] (.+$)/gm, '<li style="margin-bottom: 0.25rem; line-height: 1.5;">$1</li>')
      
      // Lists - handle ordered lists
      .replace(/^[\s]*\d+\. (.+$)/gm, '<li style="margin-bottom: 0.25rem; line-height: 1.5;">$1</li>')
      
      // Wrap consecutive list items in ul/ol tags
      .replace(/((<li[^>]*>.*?<\/li>\s*)+)/g, '<ul style="margin: 0 0 1rem 0; padding-left: 1.5rem;">$1</ul>')
      
      // Paragraphs - split by double newlines
      .split('\n\n')
      .map(paragraph => {
        paragraph = paragraph.trim()
        if (!paragraph) return ''
        
        // Skip if already wrapped in HTML tags
        if (paragraph.startsWith('<') && paragraph.includes('>')) {
          return paragraph
        }
        
        // Replace single newlines with breaks within paragraphs
        paragraph = paragraph.replace(/\n/g, '<br>')
        
        return `<p style="margin: 0 0 1rem 0; text-align: justify; line-height: 1.6;">${paragraph}</p>`
      })
      .join('')
  }

  // Function to generate PDF from markdown content
  const generatePDF = async (content: string, filename: string): Promise<boolean> => {
    try {
      // Create a temporary container for the HTML content
      const tempContainer = document.createElement('div')
      tempContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 800px;
        padding: 40px;
        font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #333;
        background: white;
      `
      
      // Use provided markdown content or render from text
      const htmlContent = markdownContent || renderMarkdownToHTML(content)
      tempContainer.innerHTML = htmlContent
      
      document.body.appendChild(tempContainer)
      
      // Generate canvas from HTML content
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Remove temporary container
      document.body.removeChild(tempContainer)
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      
      // Calculate dimensions to fit A4 page
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth - 40 // 20mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = 20 // Top margin
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight - 40 // Account for margins
      
      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 20 // New page position
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight - 40
      }
      
      // Save the PDF
      pdf.save(filename)
      return true
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      return false
    }
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
        
        return true
      } else {
        // Fallback to regular download
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
        saveAs(blob, filename)
        return true
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to save file:', error)
        // Fallback to regular download on error
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
        saveAs(blob, filename)
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
        const fileName = `${baseFileName}_improved.txt`
        const success = await saveFileAdvanced(text, fileName, 'text/plain')
        if (success && onFileSaved) {
          onFileSaved(fileName)
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
        const fileName = `${baseFileName}.md`
        const success = await saveFileAdvanced(text, fileName, 'text/markdown')
        if (success && onFileSaved) {
          onFileSaved(fileName)
        }
      }
    },
    {
      id: 'pdf',
      label: 'Save as .pdf',
      icon: '📑',
      description: 'PDF with rendered markdown',
      action: async () => {
        const baseFileName = getBaseFileName(originalFileName)
        const fileName = `${baseFileName}_enhanced.pdf`
        const success = await generatePDF(text, fileName)
        if (success && onFileSaved) {
          onFileSaved(fileName)
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
          // No notification needed here, parent handles success
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
      
      <div className="split-button" role="group" aria-label="Save options">
        <button
          className="md-button md-button-filled split-button-main"
          onClick={handleMainAction}
          disabled={disabled}
          title="Save as markdown file"
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
