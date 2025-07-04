import React, { useState } from 'react'
import FileUpload from './FileUpload.tsx'
import TextPreview from './TextPreview.tsx'
import APIKeyInput from './APIKeyInput.tsx'
import LanguageSelector from './LanguageSelector.tsx'
import AdditionalNotes from './AdditionalNotes.tsx'
import SaveOptions from './SaveOptions.tsx'
import PDFSplitView from './PDFSplitView.tsx'
import { improvePDFWithGemini } from '../services/geminiService.ts'
import type { Language } from '../services/geminiService.ts'
import './PDFTranscriber.css'

interface ProcessingState {
  processing: boolean
  error: string | null
}

const PDFTranscriber: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('')
  const [improvedText, setImprovedText] = useState<string>('')
  const [originalText, setOriginalText] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english')
  const [additionalNotes, setAdditionalNotes] = useState<string>('')
  const [processing, setProcessing] = useState<ProcessingState>({
    processing: false,
    error: null
  })

  const handleFileUpload = async (file: File) => {
    setFileName(file.name)
    setUploadedFile(file)
    setImprovedText('') // Clear previous improved text
    setOriginalText('') // Clear previous original text
    setProcessing({ processing: false, error: null })
  }

  const handleTextChange = (newText: string) => {
    setImprovedText(newText)
  }

  const handleImproveText = async () => {
    if (!apiKey) {
      setProcessing({ 
        processing: false,
        error: 'Please enter your API key first.' 
      })
      return
    }

    if (!uploadedFile) {
      setProcessing({ 
        processing: false,
        error: 'Please upload a PDF file first.' 
      })
      return
    }

    setProcessing({ processing: true, error: null })
    
    try {
      const result = await improvePDFWithGemini(uploadedFile, apiKey, selectedLanguage)
      setImprovedText(result.improvedText)
      setOriginalText(result.originalText)
    } catch (error: unknown) {
      setProcessing({ 
        processing: false,
        error: error instanceof Error
          ? error.message
          : 'Failed to enhance PDF. Please check your API key and try again.'
      })
      console.error('Gemini API error:', error)
    } finally {
      setProcessing(prev => ({ ...prev, processing: false }))
    }
  }

  return (
    <div className="pdf-transcriber">
      <div className="transcriber-section">
        <APIKeyInput 
          apiKey={apiKey} 
          onApiKeyChange={setApiKey}
          disabled={processing.processing}
        />
      </div>

      <div className="transcriber-section">
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          disabled={processing.processing}
        />
      </div>

      <div className="transcriber-section">
        <AdditionalNotes
          notes={additionalNotes}
          onNotesChange={setAdditionalNotes}
          disabled={processing.processing}
        />
      </div>

      <div className="transcriber-section">
        <FileUpload 
          onFileUpload={handleFileUpload}
          disabled={processing.processing}
          isProcessing={processing.processing}
        />
      </div>

      {processing.error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {processing.error}
        </div>
      )}

      {uploadedFile && (
        <div className="transcriber-section">
          <div className="file-info">
            <h3>📄 Uploaded: {fileName}</h3>
            <p>Ready to enhance your notes</p>
          </div>
          
          <div className="improve-section">
            <button 
              className="improve-button"
              onClick={handleImproveText}
              disabled={processing.processing || !apiKey}
            >
              {processing.processing ? (
                <>
                  <span className="spinner">⚡</span>
                  Enhancing your notes...
                </>
              ) : (
                <>
                  🤖 Enhance Notes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {improvedText && uploadedFile && (
        <div className="transcriber-section split-view-section">
          <PDFSplitView 
            file={uploadedFile}
            enhancedText={improvedText}
            originalText={originalText}
            fileName={fileName}
            onTextChange={handleTextChange}
            disabled={processing.processing}
          />
        </div>
      )}

      {improvedText && !uploadedFile && (
        <div className="transcriber-section">
          <div className="section-header">
            <h3>✨ Improved Notes</h3>
            <SaveOptions
              text={improvedText}
              originalFileName={fileName}
              disabled={processing.processing}
            />
          </div>
          <TextPreview 
            text={improvedText}
            placeholder="Improved text will appear here..."
          />
        </div>
      )}
    </div>
  )
}

export default PDFTranscriber
