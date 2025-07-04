import React, { useState } from 'react'
import './APIKeyInput.css'

interface APIKeyInputProps {
  apiKey: string
  onApiKeyChange: (key: string) => void
  disabled?: boolean
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ 
  apiKey, 
  onApiKeyChange, 
  disabled = false 
}) => {
  const [showKey, setShowKey] = useState(false)

  const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onApiKeyChange(event.target.value)
  }

  const toggleKeyVisibility = () => {
    setShowKey(!showKey)
  }

  return (
    <div className="api-key-section">
      <h3>🔑 API Key</h3>
      <div className="api-key-input-container">
        <div className="input-wrapper">
          <input
            type={showKey ? 'text' : 'password'}
            placeholder="Enter your API key for text processing..."
            value={apiKey}
            onChange={handleKeyChange}
            disabled={disabled}
            className="api-key-input"
          />
          <button
            type="button"
            className="toggle-visibility"
            onClick={toggleKeyVisibility}
            disabled={disabled}
            title={showKey ? 'Hide API key' : 'Show API key'}
          >
            {showKey ? '🙈' : '👁️'}
          </button>
        </div>
        <div className="api-key-info">
          <p>
            <strong>Need an API key?</strong> Get one from{' '}
            <a 
              href="https://makersuite.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Google AI Studio
            </a>
          </p>
          <small>
            ⚠️ Your API key is stored locally and never sent to our servers.
          </small>
        </div>
      </div>
    </div>
  )
}

export default APIKeyInput
