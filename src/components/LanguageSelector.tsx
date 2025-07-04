import React from 'react'
import type { Language } from '../services/geminiService'
import './LanguageSelector.css'

interface LanguageSelectorProps {
  selectedLanguage: Language
  onLanguageChange: (language: Language) => void
  disabled?: boolean
}

const languages: { value: Language; label: string; flag: string }[] = [
  { value: 'english', label: 'English', flag: '🇺🇸' },
  { value: 'german', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'french', label: 'Français', flag: '🇫🇷' },
  { value: 'spanish', label: 'Español', flag: '🇪🇸' },
  { value: 'italian', label: 'Italiano', flag: '🇮🇹' },
  { value: 'portuguese', label: 'Português', flag: '🇵🇹' },
  { value: 'dutch', label: 'Nederlands', flag: '🇳🇱' },
  { value: 'polish', label: 'Polski', flag: '🇵🇱' },
  { value: 'czech', label: 'Čeština', flag: '🇨🇿' },
  { value: 'slovak', label: 'Slovenčina', flag: '🇸🇰' },
  { value: 'hungarian', label: 'Magyar', flag: '🇭🇺' },
  { value: 'romanian', label: 'Română', flag: '🇷🇴' },
  { value: 'bulgarian', label: 'Български', flag: '🇧🇬' },
  { value: 'croatian', label: 'Hrvatski', flag: '🇭🇷' },
  { value: 'serbian', label: 'Српски', flag: '🇷🇸' },
  { value: 'slovenian', label: 'Slovenščina', flag: '🇸🇮' },
  { value: 'estonian', label: 'Eesti', flag: '🇪🇪' },
  { value: 'latvian', label: 'Latviešu', flag: '🇱🇻' },
  { value: 'lithuanian', label: 'Lietuvių', flag: '🇱🇹' },
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
