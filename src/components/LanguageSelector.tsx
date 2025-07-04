import React from 'react'
import './LanguageSelector.css'

export type Language = 'english' | 'german' | 'french' | 'russian'

interface LanguageSelectorProps {
  selectedLanguage: Language
  onLanguageChange: (language: Language) => void
  disabled?: boolean
}

const languages: { value: Language; label: string; flag: string }[] = [
  { value: 'english', label: 'English', flag: '🇺🇸' },
  { value: 'german', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'french', label: 'Français', flag: '🇫🇷' },
  { value: 'russian', label: 'Русский', flag: '🇷🇺' },
]

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  disabled = false
}) => {
  return (
    <div className="language-selector">
      <label htmlFor="language-select" className="language-label">
        🌐 Output Language
      </label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        disabled={disabled}
        className="language-select"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
      <p className="language-description">
        Your notes will be preserved and enhanced in the selected language
      </p>
    </div>
  )
}

export default LanguageSelector
