import React from 'react'
import './AdditionalNotes.css'

interface AdditionalNotesProps {
  notes: string
  onNotesChange: (notes: string) => void
  disabled?: boolean
}

const AdditionalNotes: React.FC<AdditionalNotesProps> = ({
  notes,
  onNotesChange,
  disabled = false
}) => {
  return (
    <div className="additional-notes">
      <label htmlFor="additional-notes-input" className="notes-label">
        📋 Additional Context for Processing
      </label>
      <textarea
        id="additional-notes-input"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        disabled={disabled}
        className="notes-textarea"
        placeholder="Add any specific instructions, context, or requirements for processing your notes. For example: 'Focus on creating a study guide format' or 'Emphasize key concepts for exam preparation'"
        rows={4}
      />
      <p className="notes-description">
        This information will help the system better understand how to enhance your notes according to your specific needs.
      </p>
    </div>
  )
}

export default AdditionalNotes
