import React, { useState, useEffect, useRef } from 'react'
import { ConversationAgent } from '../services/conversationService'
import type { ConversationState } from '../services/conversationService'
import './InteractiveReview.css'

interface InteractiveReviewProps {
  originalText: string
  improvedText: string
  apiKey: string
  onTextUpdated: (newText: string) => void
  onComplete?: () => void
  currentEditorText?: string
  onIterationProposed?: (result: { newText: string; changes: string[] }) => void // New prop for proposing changes
}

const InteractiveReview: React.FC<InteractiveReviewProps> = ({
  originalText,
  improvedText,
  apiKey,
  onTextUpdated,
  onComplete,
  currentEditorText,
  onIterationProposed
}) => {
  const [agent, setAgent] = useState<ConversationAgent | null>(null)
  const [conversation, setConversation] = useState<ConversationState | null>(null)
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isIterating, setIsIterating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (apiKey && originalText && improvedText) {
      const newAgent = new ConversationAgent(apiKey, originalText, improvedText)
      setAgent(newAgent)
    }
  }, [apiKey, originalText, improvedText])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages, isLoading, isIterating])

  const startReview = async () => {
    if (!agent) return
    
    setIsLoading(true)
    try {
      await agent.startReview()
      setConversation(agent.getState())
      setIsStarted(true)
    } catch (error) {
      console.error('Error starting review:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!agent || !userInput.trim() || isLoading) return

    setIsLoading(true)
    try {
      await agent.processUserResponse(userInput.trim())
      setConversation(agent.getState())
      setUserInput('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const iterateOnText = async () => {
    if (!agent || !currentEditorText || !onIterationProposed) return
    
    setIsIterating(true)
    
    try {
      const result = await agent.iterateOnText(currentEditorText)
      onIterationProposed(result)
    } catch (error) {
      console.error('Error during iteration:', error)
      // Could add error state here if needed
    } finally {
      setIsIterating(false)
    }
  }

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
  }

  if (!isStarted) {
    return (
      <div className="interactive-review-container">
        <div className="review-intro">
          <h3>🤖 Interactive AI Review</h3>
          <p>
            Let me help you refine your notes further through an interactive conversation. 
            I'll ask you questions about your preferences and suggest targeted improvements.
          </p>
          <button 
            className="start-review-btn"
            onClick={startReview}
            disabled={isLoading || !agent}
          >
            {isLoading ? 'Starting...' : 'Start Interactive Review'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="interactive-review-container">
      <div className="conversation-header">
        <h3>🤖 Interactive Review Session</h3>
        <div className="phase-indicator">
          Phase: <span className="phase">{conversation?.reviewPhase || 'initial'}</span>
        </div>
      </div>

      <div className="conversation-area">
        <div className="messages">
          {conversation?.messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-header">
                <span className="role-indicator">
                  {message.role === 'assistant' ? '🤖' : '👤'}
                </span>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div 
                className="message-content"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-header">
                <span className="role-indicator">🤖</span>
                <span className="timestamp">Now</span>
              </div>
              <div className="message-content loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              disabled={isLoading}
              rows={3}
            />
            <button 
              onClick={sendMessage}
              disabled={!userInput.trim() || isLoading}
              className="send-btn"
            >
              Send
            </button>
          </div>
          <div className="quick-actions">
            <button 
              onClick={iterateOnText}
              className="iterate-btn"
              disabled={isIterating || !currentEditorText || !onIterationProposed}
            >
              {isIterating ? (
                <>
                  <div className="loading-spinner"></div>
                  Generating improvements...
                </>
              ) : (
                <>🔄 Apply in Editor</>
              )}
            </button>
          </div>
          
          {isIterating && (
            <div className="iteration-loading">
              <div className="loading-message">
                <div className="loading-spinner-large"></div>
                <p>Analyzing conversation and generating improved text...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InteractiveReview
