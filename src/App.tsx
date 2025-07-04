import { useState } from 'react'
import NavigationRail from './components/NavigationRail.tsx'
import type { NavigationStep } from './components/NavigationRail.tsx'
import MaterialDialog from './components/MaterialDialog.tsx'
import APIKeyInput from './components/APIKeyInput.tsx'
import LanguageSelector from './components/LanguageSelector.tsx'
import type { Language } from './components/LanguageSelector.tsx'
import FileUpload from './components/FileUpload.tsx'
import PDFSplitView from './components/PDFSplitView.tsx'
import SaveOptions from './components/SaveOptions.tsx'
import { improvePDFWithGemini } from './services/geminiService.ts'
import './App.css'

interface ProcessingState {
  processing: boolean
  error: string | null
}

function App() {
  // App state
  const [currentStep, setCurrentStep] = useState<string>('api-key')
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  
  // User data
  const [apiKey, setApiKey] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english')
  const [hasUserSelectedLanguage, setHasUserSelectedLanguage] = useState<boolean>(false) // Track if user interacted with language selector
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [improvedText, setImprovedText] = useState<string>('')
  const [hasUserSaved, setHasUserSaved] = useState<boolean>(false) // Track if user has saved
  
  // Processing state
  const [processing, setProcessing] = useState<ProcessingState>({
    processing: false,
    error: null
  })

  // Navigation steps
  const navigationSteps: NavigationStep[] = [
    {
      id: 'api-key',
      label: 'API Key',
      icon: '🔑',
      completed: !!apiKey,
      current: currentStep === 'api-key',
      disabled: false // Always allow going back to API key
    },
    {
      id: 'language',
      label: 'Language',
      icon: '🌐',
      completed: hasUserSelectedLanguage, // Only completed if user actively interacted with selector
      current: currentStep === 'language',
      disabled: false // Allow going back once API key is set
    },
    {
      id: 'upload',
      label: 'Upload PDF',
      icon: '📄',
      completed: !!uploadedFile,
      current: currentStep === 'upload',
      disabled: false // Allow going back to upload different file
    },
    {
      id: 'enhance',
      label: 'Enhance Notes',
      icon: '✨',
      completed: !!improvedText,
      current: currentStep === 'enhance',
      disabled: !uploadedFile || !apiKey
    },
    {
      id: 'review',
      label: 'Review & Save',
      icon: '💾',
      completed: hasUserSaved, // Only completed when user actually saves
      current: currentStep === 'review',
      disabled: !improvedText
    }
  ]

  const handleStepClick = (stepId: string) => {
    const step = navigationSteps.find(s => s.id === stepId)
    if (step && !step.disabled) {
      setCurrentStep(stepId)
      // Only open dialog for interactive steps, skip 'enhance' and 'review' 
      if (['api-key', 'language', 'upload'].includes(stepId)) {
        setOpenDialog(stepId)
      }
    }
  }

  const handleFileSaved = () => {
    setHasUserSaved(true)
  }

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language)
    setHasUserSelectedLanguage(true) // Mark that user has interacted with language selector
  }

  const handleFileUpload = async (file: File) => {
    setFileName(file.name)
    setUploadedFile(file)
    setImprovedText('') // Clear previous improved text
    setHasUserSaved(false) // Reset save status
    setProcessing({ processing: false, error: null })
    setOpenDialog(null)
    setCurrentStep('enhance')
    // Auto-advance to enhance step in main content
  }

  const handleImproveText = async () => {
    if (!apiKey || !uploadedFile) return

    setProcessing({ processing: true, error: null })
    setOpenDialog(null)
    
    try {
      const improved = await improvePDFWithGemini(uploadedFile, apiKey, selectedLanguage)
      setImprovedText(improved)
      setCurrentStep('review')
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

  const handleTextChange = (newText: string) => {
    setImprovedText(newText)
  }

  const closeDialog = () => {
    setOpenDialog(null)
  }

  const getMainContent = () => {
    if (processing.processing) {
      return (
        <div className="main-content processing">
          <div className="processing-card">
            <div className="processing-icon">⚡</div>
            <h2>Enhancing your notes...</h2>
            <p>Our AI is analyzing your PDF and improving the content</p>
            <div className="processing-spinner">
              <div className="spinner-ring"></div>
            </div>
          </div>
        </div>
      )
    }

    if (improvedText && uploadedFile) {
      return (
        <div className="main-content review">
          <PDFSplitView 
            file={uploadedFile}
            enhancedText={improvedText}
            fileName={fileName}
            onTextChange={handleTextChange}
            disabled={false}
            onFileSaved={handleFileSaved}
          />
        </div>
      )
    }

    if (uploadedFile && !improvedText) {
      return (
        <div className="main-content enhance">
          <div className="enhance-card">
            <div className="card-header">
              <button 
                className="settings-button"
                onClick={() => handleStepClick('api-key')}
                title="Change settings"
              >
                ⚙️ Settings
              </button>
            </div>
            
            <div className="file-info">
              <div className="file-icon">📄</div>
              <h2>PDF Ready for Enhancement</h2>
              <p className="file-name">{fileName}</p>
              <p className="file-description">
                Your PDF has been uploaded successfully. Click the button below to enhance your notes with AI.
              </p>
            </div>
            
            <button 
              className="enhance-button primary"
              onClick={handleImproveText}
              disabled={!apiKey}
            >
              <span className="button-icon">🤖</span>
              Enhance Notes with AI
            </button>
            
            <div className="card-footer">
              <button 
                className="action-button secondary"
                onClick={() => handleStepClick('upload')}
              >
                📄 Upload Different PDF
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="main-content welcome">
        <div className="welcome-card">
          <div className="welcome-icon">📝</div>
          <h1>Welcome to HybridNotes</h1>
          <p className="welcome-subtitle">Paper is not obsolete.</p>
          <p className="welcome-description">
            Transform your handwritten notes and documents with AI-powered enhancement. 
            Follow the guided setup process to get started.
            <br /><br />
            <strong>💡 Tip:</strong> Use modern browsers (Chrome, Edge) for the best file saving experience - you can save enhanced notes directly to the same folder as your PDF!
          </p>
          
          <div className="quick-actions">
            <button 
              className="action-button primary"
              onClick={() => {
                setCurrentStep('api-key')
                setOpenDialog('api-key')
              }}
            >
              Get Started
            </button>
            <button 
              className="action-button secondary"
              onClick={() => handleStepClick('upload')}
              disabled={!apiKey}
            >
              Upload PDF
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>
      
      <NavigationRail 
        steps={navigationSteps}
        onStepClick={(stepId) => {
          handleStepClick(stepId)
          setMobileMenuOpen(false) // Close mobile menu when step is clicked
        }}
        className={mobileMenuOpen ? 'open' : ''}
      />
      
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <main className="app-main">
        {processing.error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{processing.error}</span>
            <button 
              className="error-dismiss"
              onClick={() => setProcessing(prev => ({ ...prev, error: null }))}
            >
              ✕
            </button>
          </div>
        )}
        
        {getMainContent()}
      </main>

      {/* Dialogs */}
      <MaterialDialog
        open={openDialog === 'api-key'}
        onClose={closeDialog}
        title="🔑 API Key Setup"
        maxWidth="sm"
      >
        <div className="dialog-step">
          <p className="step-description">
            Enter your Google Gemini API key to enable AI-powered note enhancement.
          </p>
          <APIKeyInput 
            apiKey={apiKey} 
            onApiKeyChange={setApiKey}
            disabled={false}
          />
          <div className="dialog-actions">
            <button 
              className="button secondary"
              onClick={closeDialog}
            >
              Cancel
            </button>
            <button 
              className="button primary"
              onClick={() => {
                if (apiKey) {
                  closeDialog()
                  setTimeout(() => {
                    setCurrentStep('language')
                    setOpenDialog('language')
                  }, 200)
                }
              }}
              disabled={!apiKey}
            >
              Continue
            </button>
          </div>
        </div>
      </MaterialDialog>

      <MaterialDialog
        open={openDialog === 'language'}
        onClose={closeDialog}
        title="🌐 Language Selection"
        maxWidth="sm"
      >
        <div className="dialog-step">
          <p className="step-description">
            Choose the output language for your enhanced notes.
          </p>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            disabled={false}
          />
          <div className="dialog-actions">
            <button 
              className="button secondary"
              onClick={() => {
                closeDialog()
                setCurrentStep('api-key')
              }}
            >
              Back
            </button>
            <button 
              className="button primary"
              onClick={() => {
                closeDialog()
                setTimeout(() => {
                  setCurrentStep('upload')
                  setOpenDialog('upload')
                }, 200)
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </MaterialDialog>

      <MaterialDialog
        open={openDialog === 'upload'}
        onClose={closeDialog}
        title="📄 Upload PDF"
        maxWidth="md"
      >
        <div className="dialog-step">
          <p className="step-description">
            Upload your PDF document to extract and enhance the content.
          </p>
          <FileUpload 
            onFileUpload={handleFileUpload}
            disabled={false}
            isProcessing={false}
          />
          <div className="dialog-actions">
            <button 
              className="button secondary"
              onClick={() => {
                closeDialog()
                setCurrentStep('language')
                setTimeout(() => setOpenDialog('language'), 200)
              }}
            >
              Back
            </button>
          </div>
        </div>
      </MaterialDialog>

      <MaterialDialog
        open={openDialog === 'review'}
        onClose={closeDialog}
        title="💾 Save Your Enhanced Notes"
        maxWidth="sm"
      >
        <div className="dialog-step">
          <p className="step-description">
            Your notes have been enhanced! Choose how you'd like to save them.
          </p>
          <SaveOptions
            text={improvedText}
            originalFileName={fileName}
            disabled={false}
            onFileSaved={handleFileSaved}
          />
          <div className="dialog-actions">
            <button 
              className="button primary"
              onClick={closeDialog}
            >
              Done
            </button>
          </div>
        </div>
      </MaterialDialog>
    </div>
  )
}

export default App
