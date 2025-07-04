import React, { useEffect, useRef } from 'react'
import './MaterialDialog.css'

interface MaterialDialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  fullScreen?: boolean
}

const MaterialDialog: React.FC<MaterialDialogProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'md',
  fullScreen = false
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`material-dialog ${fullScreen ? 'fullscreen' : ''} ${maxWidth}`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="dialog-container">
        <header className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
          <button
            className="dialog-close-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </header>
        <div className="dialog-content">
          {children}
        </div>
      </div>
    </dialog>
  )
}

export default MaterialDialog
