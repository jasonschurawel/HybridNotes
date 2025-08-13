import React, { useRef, useState } from 'react'
import './FileUpload.css'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  disabled?: boolean
  isProcessing?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUpload, 
  disabled = false, 
  isProcessing = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (file && file.type === 'application/pdf') {
      // Check file size (2GB limit with Files API)
      const maxFileSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > maxFileSize) {
        alert(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 2GB limit. Please choose a smaller PDF file or split it into smaller documents.`);
        // Clear the input
        event.target.value = '';
        return;
      }
      onFileUpload(file)
    } else if (file) {
      alert('Please select a PDF file.')
      // Clear the input
      event.target.value = '';
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = event.dataTransfer.files
    const file = files[0]
    
    if (file && file.type === 'application/pdf') {
      // Check file size (2GB limit with Files API)
      const maxFileSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > maxFileSize) {
        alert(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 2GB limit. Please choose a smaller PDF file or split it into smaller documents.`);
        return;
      }
      onFileUpload(file)
    } else if (file) {
      alert('Please select a PDF file.')
    }
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="file-upload-section">
      <h3>📁 Upload PDF File</h3>
      <div
        className={`file-upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />
        
        {isProcessing ? (
          <div className="upload-content processing">
            <div className="spinner">📄</div>
            <p>Extracting text from PDF...</p>
            <small>This may take a moment</small>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📄</div>
            <p>
              <strong>Click to select</strong> or drag and drop your PDF file here
            </p>
            <small>Only PDF files are supported (max 2GB)</small>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload
