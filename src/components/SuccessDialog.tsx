import React from 'react'
import MaterialDialog from './MaterialDialog'
import './SuccessDialog.css'

interface SuccessDialogProps {
  open: boolean
  onClose: () => void
  fileName: string
  onTranscribeNext: () => void
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  open,
  onClose,
  fileName,
  onTranscribeNext
}) => {
  return (
    <MaterialDialog
      open={open}
      onClose={onClose}
      title="✅ Note Saved Successfully!"
      maxWidth="sm"
    >
      <div className="success-dialog-content">
        <div className="success-icon">
          🎉
        </div>
        <p className="success-message">
          Your note was saved as <strong>{fileName}</strong>
        </p>
        <div className="success-actions">
          <button 
            className="button secondary"
            onClick={onClose}
          >
            OK
          </button>
          <button 
            className="button primary"
            onClick={onTranscribeNext}
          >
            📝 Transcribe Next Note
          </button>
        </div>
      </div>
    </MaterialDialog>
  )
}

export default SuccessDialog
