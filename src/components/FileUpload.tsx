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
      onFileUpload(file)
    } else if (file) {
      alert('Please select a PDF file.')
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
            <small>Only PDF files are supported</small>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload
