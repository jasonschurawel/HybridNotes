import React, { useState, useEffect, useRef, useCallback } from 'react'
import { EnhancedConversationAgent } from '../services/conversationService'
import type { EnhancedConversationState, TheoryStatement, ReviewPhase } from '../services/conversationService'
import './InteractiveReview.css'

interface InteractiveReviewProps {
  originalText: string
  improvedText: string
  apiKey: string
  currentEditorText?: string
  onIterationProposed?: (result: { newText: string; changes: string[] }) => void
}

interface QuestionOption {
  id: string
  text: string
  value: string
}

interface PhaseQuestion {
  id: string
  question: string
  type: 'select' | 'text' | 'multiselect'
  options?: QuestionOption[]
  required: boolean
}

const InteractiveReview: React.FC<InteractiveReviewProps> = ({
  originalText,
  improvedText,
  apiKey,
  currentEditorText,
  onIterationProposed
}) => {
  const [agent, setAgent] = useState<EnhancedConversationAgent | null>(null)
  const [conversation, setConversation] = useState<EnhancedConversationState | null>(null)
  const [currentTab, setCurrentTab] = useState<'review' | 'theory'>('review')
  const [currentPhase, setCurrentPhase] = useState<ReviewPhase>('metadata')
  const [isLoading, setIsLoading] = useState(false)
  const [isIterating, setIsIterating] = useState(false)
  const [currentQuestions, setCurrentQuestions] = useState<PhaseQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('')
  const [phaseAnswers, setPhaseAnswers] = useState<Record<string, Record<string, string | string[]>>>({})
  const [theoryStatements, setTheoryStatements] = useState<TheoryStatement[]>([])
  const [suggestedOptions, setSuggestedOptions] = useState<QuestionOption[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (apiKey && originalText && improvedText) {
      const newAgent = new EnhancedConversationAgent(apiKey, originalText, improvedText)
      setAgent(newAgent)
      // Auto-start the review when agent is ready
      initializeReview(newAgent)
    }
  }, [apiKey, originalText, improvedText])

  const initializeReview = useCallback(async (agentToUse: EnhancedConversationAgent) => {
    setIsLoading(true)
    try {
      await agentToUse.initializeReview()
      setConversation(agentToUse.getState())
      const questions = getPhaseQuestions('metadata')
      setCurrentQuestions(questions)
      
      // Generate suggestions for the first question if it's a text question
      if (questions[0] && questions[0].type === 'text') {
        generateSuggestionsForTextQuestion(questions[0])
      }
    } catch (error) {
      console.error('Error starting review:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isIterating) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation?.messages, isLoading, isIterating])

  // Phase definitions with structured questions
  const getPhaseQuestions = (phase: ReviewPhase): PhaseQuestion[] => {
    switch (phase) {
      case 'metadata':
        return [
          {
            id: 'purpose',
            question: 'What is the primary purpose of these notes?',
            type: 'select',
            options: [
              { id: 'study', text: 'Study material for exam preparation', value: 'study' },
              { id: 'meeting', text: 'Meeting minutes or discussion notes', value: 'meeting' },
              { id: 'research', text: 'Research notes for a project', value: 'research' },
              { id: 'lecture', text: 'Lecture or presentation notes', value: 'lecture' },
              { id: 'reference', text: 'Reference material for future use', value: 'reference' },
              { id: 'other', text: 'Other (please specify in next question)', value: 'other' }
            ],
            required: true
          },
          {
            id: 'topic',
            question: 'What is the main topic or subject area?',
            type: 'text',
            required: true
          },
          {
            id: 'format',
            question: 'What format do you prefer for your notes?',
            type: 'multiselect',
            options: [
              { id: 'bullets', text: 'Bullet points for easy scanning', value: 'bullets' },
              { id: 'paragraphs', text: 'Full paragraphs for detailed explanations', value: 'paragraphs' },
              { id: 'headings', text: 'Clear headings and sections', value: 'headings' },
              { id: 'numbered', text: 'Numbered lists for ordered information', value: 'numbered' },
              { id: 'tables', text: 'Tables for structured data', value: 'tables' }
            ],
            required: true
          },
          {
            id: 'detail_level',
            question: 'How detailed should the notes be?',
            type: 'select',
            options: [
              { id: 'concise', text: 'Concise - just the key points', value: 'concise' },
              { id: 'moderate', text: 'Moderate - important details included', value: 'moderate' },
              { id: 'comprehensive', text: 'Comprehensive - all available information', value: 'comprehensive' }
            ],
            required: true
          }
        ]
      
      case 'verification':
        return [
          {
            id: 'accuracy_check',
            question: 'Are there any facts or details that seem incorrect or misunderstood?',
            type: 'text',
            required: false
          },
          {
            id: 'missing_info',
            question: 'Is there any important information that was missed?',
            type: 'text',
            required: false
          },
          {
            id: 'structure_issues',
            question: 'Are there any sections that should be reorganized?',
            type: 'text',
            required: false
          },
          {
            id: 'emphasis_check',
            question: 'Are the most important points properly emphasized?',
            type: 'select',
            options: [
              { id: 'yes', text: 'Yes, the emphasis is appropriate', value: 'yes' },
              { id: 'some_issues', text: 'Some important points need more emphasis', value: 'some_issues' },
              { id: 'major_issues', text: 'Major emphasis problems throughout', value: 'major_issues' }
            ],
            required: true
          }
        ]
      
      case 'customization':
        return [
          {
            id: 'style_preferences',
            question: 'Do you have any specific writing style preferences?',
            type: 'text',
            required: false
          },
          {
            id: 'specific_changes',
            question: 'Are there any specific sections that need particular attention?',
            type: 'text',
            required: false
          },
          {
            id: 'additional_requests',
            question: 'Any other improvements or changes you\'d like to see?',
            type: 'text',
            required: false
          }
        ]
      
      default:
        return []
    }
  }

  const generateSuggestionsForTextQuestion = useCallback(async (question: PhaseQuestion) => {
    if (!agent || question.type !== 'text') return

    setIsGeneratingSuggestions(true)
    try {
      // Use the agent's AI to generate contextual suggestions
      const prompt = `Based on the PDF content and the question "${question.question}", generate 4-5 relevant, specific answer options that would be appropriate for this user's notes. 

IMPORTANT: Return ONLY a valid JSON array of strings. No additional text, no markdown formatting, no explanations.

Example format:
["Option 1 text", "Option 2 text", "Option 3 text", "Option 4 text"]

Question: ${question.question}`
      
      const response = await agent.generateResponse(prompt)
      console.log('AI Response:', response)
      
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = response.trim()
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      console.log('Cleaned Response:', cleanedResponse)
      
      // Try to parse the response as JSON
      try {
        const suggestions = JSON.parse(cleanedResponse)
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          const options = suggestions.slice(0, 5).map((suggestion, index) => ({
            id: `suggestion-${index}`,
            text: String(suggestion).trim(),
            value: String(suggestion).trim()
          }))
          console.log('Generated options:', options)
          setSuggestedOptions(options)
        } else {
          throw new Error('Response is not a valid array')
        }
      } catch (parseError) {
        console.warn('JSON parsing failed, trying fallback:', parseError)
        // If parsing fails, create options from the response text
        const lines = cleanedResponse.split('\n').filter(line => line.trim().length > 0)
        if (lines.length > 0) {
          const options = lines.slice(0, 5).map((line, index) => ({
            id: `suggestion-${index}`,
            text: line.replace(/^[-*•"[\]0-9.,\s]*/, '').replace(/["]*$/, '').trim(),
            value: line.replace(/^[-*•"[\]0-9.,\s]*/, '').replace(/["]*$/, '').trim()
          })).filter(option => option.text.length > 0)
          console.log('Fallback options:', options)
          setSuggestedOptions(options)
        } else {
          // Final fallback - provide generic suggestions based on question type
          const fallbackOptions = getFallbackSuggestions(question.question)
          console.log('Using fallback suggestions:', fallbackOptions)
          setSuggestedOptions(fallbackOptions)
        }
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
      // Use fallback suggestions if everything fails
      const fallbackOptions = getFallbackSuggestions(question.question)
      setSuggestedOptions(fallbackOptions)
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }, [agent])

  const getFallbackSuggestions = (questionText: string): QuestionOption[] => {
    const question = questionText.toLowerCase()
    
    if (question.includes('purpose') || question.includes('use')) {
      return [
        { id: 'fallback-1', text: 'Study material for exam preparation', value: 'Study material for exam preparation' },
        { id: 'fallback-2', text: 'Meeting notes and action items', value: 'Meeting notes and action items' },
        { id: 'fallback-3', text: 'Research documentation', value: 'Research documentation' },
        { id: 'fallback-4', text: 'Project reference material', value: 'Project reference material' }
      ]
    } else if (question.includes('topic') || question.includes('subject')) {
      return [
        { id: 'fallback-1', text: 'Business and management', value: 'Business and management' },
        { id: 'fallback-2', text: 'Technology and engineering', value: 'Technology and engineering' },
        { id: 'fallback-3', text: 'Science and research', value: 'Science and research' },
        { id: 'fallback-4', text: 'Academic study material', value: 'Academic study material' }
      ]
    } else if (question.includes('incorrect') || question.includes('wrong')) {
      return [
        { id: 'fallback-1', text: 'No, everything looks accurate', value: 'No, everything looks accurate' },
        { id: 'fallback-2', text: 'Some technical details need correction', value: 'Some technical details need correction' },
        { id: 'fallback-3', text: 'Dates or numbers seem off', value: 'Dates or numbers seem off' },
        { id: 'fallback-4', text: 'Context is misunderstood', value: 'Context is misunderstood' }
      ]
    } else if (question.includes('missing') || question.includes('left out')) {
      return [
        { id: 'fallback-1', text: 'No, all important points are covered', value: 'No, all important points are covered' },
        { id: 'fallback-2', text: 'Some key details were missed', value: 'Some key details were missed' },
        { id: 'fallback-3', text: 'Important examples are missing', value: 'Important examples are missing' },
        { id: 'fallback-4', text: 'Context information is needed', value: 'Context information is needed' }
      ]
    } else {
      return [
        { id: 'fallback-1', text: 'Yes, this looks good', value: 'Yes, this looks good' },
        { id: 'fallback-2', text: 'Needs some improvements', value: 'Needs some improvements' },
        { id: 'fallback-3', text: 'Requires significant changes', value: 'Requires significant changes' },
        { id: 'fallback-4', text: 'Not applicable to my content', value: 'Not applicable to my content' }
      ]
    }
  }

  const switchPhase = (phase: ReviewPhase) => {
    setCurrentPhase(phase)
    const questions = getPhaseQuestions(phase)
    setCurrentQuestions(questions)
    setCurrentQuestionIndex(0)
    setCurrentAnswer('')
    setSuggestedOptions([])
    setShowCustomInput(false)
    
    // Generate suggestions for the first question if it's a text question
    if (questions[0] && questions[0].type === 'text') {
      generateSuggestionsForTextQuestion(questions[0])
    }
  }

  const handleAnswerChange = (_questionId: string, value: string | string[]) => {
    setCurrentAnswer(value)
  }

  const handleAnswerSubmit = async () => {
    if (!agent || currentQuestionIndex >= currentQuestions.length) return

    const currentQuestion = currentQuestions[currentQuestionIndex]
    
    // Store the answer
    setPhaseAnswers(prev => ({
      ...prev,
      [currentPhase]: {
        ...prev[currentPhase],
        [currentQuestion.id]: currentAnswer
      }
    }))

    setIsLoading(true)
    try {
      // Process this single answer immediately into theory
      const response = {
        question: currentQuestion.question,
        answer: Array.isArray(currentAnswer) ? currentAnswer.join(', ') : currentAnswer,
        questionId: currentQuestion.id
      }

      await agent.processPhaseResponses(currentPhase, [response])
      const updatedState = agent.getState()
      setConversation(updatedState)
      setTheoryStatements(updatedState.theoryStatements || [])

      // Move to next question
      moveToNextQuestion()
    } catch (error) {
      console.error('Error processing answer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipQuestion = () => {
    moveToNextQuestion()
  }

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setCurrentAnswer('')
      setSuggestedOptions([])
      setShowCustomInput(false)
      
      // Generate suggestions for the new question if it's a text question
      const nextQuestion = currentQuestions[currentQuestionIndex + 1]
      if (nextQuestion && nextQuestion.type === 'text') {
        generateSuggestionsForTextQuestion(nextQuestion)
      }
    }
  }

  const moveToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setSuggestedOptions([])
      setShowCustomInput(false)
      
      // Load previous answer if it exists
      const prevQuestion = currentQuestions[currentQuestionIndex - 1]
      const prevAnswer = phaseAnswers[currentPhase]?.[prevQuestion.id] || ''
      setCurrentAnswer(prevAnswer)
      
      // Generate suggestions for text questions
      if (prevQuestion && prevQuestion.type === 'text') {
        generateSuggestionsForTextQuestion(prevQuestion)
      }
    }
  }

  const getCurrentQuestion = (): PhaseQuestion | null => {
    return currentQuestions[currentQuestionIndex] || null
  }

  const isLastQuestion = (): boolean => {
    return currentQuestionIndex >= currentQuestions.length - 1
  }

  const isFirstQuestion = (): boolean => {
    return currentQuestionIndex === 0
  }

  const removeTheoryStatement = async (statementId: string) => {
    if (!agent) return

    try {
      await agent.removeTheoryStatement(statementId)
      const updatedState = agent.getState()
      setTheoryStatements(updatedState.theoryStatements || [])
    } catch (error) {
      console.error('Error removing theory statement:', error)
    }
  }

  const applyTheoryToNotes = async () => {
    if (!agent || !onIterationProposed) return
    
    setIsIterating(true)
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 10)
    
    try {
      const result = await agent.applyTheoryToText(currentEditorText || improvedText)
      onIterationProposed(result)
    } catch (error) {
      console.error('Error applying theory:', error)
    } finally {
      setIsIterating(false)
    }
  }

  const renderQuestionInput = (question: PhaseQuestion) => {
    switch (question.type) {
      case 'select':
        return (
          <div className="question-buttons">
            {question.options?.map(option => (
              <button
                key={option.id}
                className={`option-btn ${currentAnswer === option.value ? 'selected' : ''}`}
                onClick={() => handleAnswerChange(question.id, option.value)}
              >
                {option.text}
              </button>
            ))}
          </div>
        )

      case 'multiselect':
        return (
          <div className="question-buttons multiselect">
            {question.options?.map(option => (
              <button
                key={option.id}
                className={`option-btn ${(currentAnswer as string[] || []).includes(option.value) ? 'selected' : ''}`}
                onClick={() => {
                  const currentAnswers = (currentAnswer as string[]) || []
                  if (currentAnswers.includes(option.value)) {
                    handleAnswerChange(question.id, currentAnswers.filter(a => a !== option.value))
                  } else {
                    handleAnswerChange(question.id, [...currentAnswers, option.value])
                  }
                }}
              >
                {option.text}
              </button>
            ))}
          </div>
        )

      case 'text':
        return (
          <div className="text-question-container">
            {isGeneratingSuggestions && (
              <div className="generating-suggestions">
                <div className="loading-spinner"></div>
                <span>Generating suggestions...</span>
              </div>
            )}
            
            {suggestedOptions.length > 0 && !showCustomInput && (
              <div className="suggested-options">
                <p className="suggestions-label">💡 Suggested answers:</p>
                <div className="question-buttons">
                  {suggestedOptions.map(option => (
                    <button
                      key={option.id}
                      className={`option-btn ${currentAnswer === option.value ? 'selected' : ''}`}
                      onClick={() => handleAnswerChange(question.id, option.value)}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
                <button 
                  className="custom-input-btn"
                  onClick={() => setShowCustomInput(true)}
                >
                  ✏️ None of these fit - I'll type my own
                </button>
              </div>
            )}

            {/* Debug information - remove later */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ 
                background: '#f0f0f0', 
                padding: '10px', 
                margin: '10px 0', 
                fontSize: '12px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}>
                <strong>Debug:</strong><br/>
                Generating: {isGeneratingSuggestions ? 'true' : 'false'}<br/>
                Suggestions count: {suggestedOptions.length}<br/>
                Show custom: {showCustomInput ? 'true' : 'false'}<br/>
                {suggestedOptions.length > 0 && (
                  <>
                    Suggestions: {JSON.stringify(suggestedOptions.map(s => s.text), null, 2)}
                  </>
                )}
              </div>
            )}
            
            {(showCustomInput || suggestedOptions.length === 0) && !isGeneratingSuggestions && (
              <div className="custom-input-section">
                {suggestedOptions.length > 0 && (
                  <button 
                    className="back-to-suggestions-btn"
                    onClick={() => {
                      setShowCustomInput(false)
                      setCurrentAnswer('')
                    }}
                  >
                    ⬅️ Back to suggestions
                  </button>
                )}
                <textarea
                  value={currentAnswer as string || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="question-textarea"
                  placeholder="Enter your response..."
                  rows={4}
                  required={question.required}
                />
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (!agent) {
    return (
      <div className="interactive-review-container">
        <div className="review-loading">
          <div className="loading-spinner-large"></div>
          <p>Initializing Smart Review...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="interactive-review-container">
      <div className="review-header">
        <h3>🧠 Smart Interactive Review</h3>
        <div className="main-tabs">
          <button 
            className={`main-tab-btn ${currentTab === 'review' ? 'active' : ''}`}
            onClick={() => setCurrentTab('review')}
          >
            💬 Review
          </button>
          <button 
            className={`main-tab-btn ${currentTab === 'theory' ? 'active' : ''}`}
            onClick={() => setCurrentTab('theory')}
          >
            🧠 Theory ({theoryStatements.length})
          </button>
        </div>
      </div>

      {currentTab === 'review' && (
        <div className="review-content">
          <div className="phase-segmented-control">
            <div className="segmented-buttons">
              <button 
                className={`segment-btn ${currentPhase === 'metadata' ? 'active' : ''}`}
                onClick={() => switchPhase('metadata')}
              >
                📋 Metadata
              </button>
              <button 
                className={`segment-btn ${currentPhase === 'verification' ? 'active' : ''}`}
                onClick={() => switchPhase('verification')}
              >
                🔍 Verification
              </button>
              <button 
                className={`segment-btn ${currentPhase === 'customization' ? 'active' : ''}`}
                onClick={() => switchPhase('customization')}
              >
                🎨 Customization
              </button>
            </div>
          </div>

          <div className="phase-content">
            <div className="phase-header">
              <h4>
                {currentPhase === 'metadata' && '📋 Note Metadata & Format'}
                {currentPhase === 'verification' && '🔍 Content Verification'}
                {currentPhase === 'customization' && '🎨 Custom Preferences'}
              </h4>
              <p>
                {currentPhase === 'metadata' && 'Help me understand what these notes are for and how you like them structured.'}
                {currentPhase === 'verification' && 'Let\'s verify that I understood your content correctly and didn\'t miss anything important.'}
                {currentPhase === 'customization' && 'Tell me about any specific changes or customizations you\'d like to make.'}
              </p>
            </div>

            <div className="question-progress">
              <div className="progress-indicator">
                Question {currentQuestionIndex + 1} of {currentQuestions.length}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {getCurrentQuestion() && (
              <div className="current-question">
                <div className="question-item">
                  <label className="question-label">
                    {getCurrentQuestion()!.question}
                    {getCurrentQuestion()!.required && <span className="required">*</span>}
                  </label>
                  {renderQuestionInput(getCurrentQuestion()!)}
                </div>

                <div className="question-actions">
                  <button 
                    className="nav-btn prev-btn"
                    onClick={moveToPreviousQuestion}
                    disabled={isFirstQuestion()}
                  >
                    ⬅️ Previous
                  </button>
                  
                  <button 
                    className="action-btn skip-btn"
                    onClick={handleSkipQuestion}
                    disabled={isLoading}
                  >
                    ⏭️ Skip
                  </button>
                  
                  <button 
                    className="action-btn answer-btn"
                    onClick={handleAnswerSubmit}
                    disabled={isLoading || (!currentAnswer && getCurrentQuestion()!.required)}
                  >
                    {isLoading ? 'Processing...' : (isLastQuestion() ? '✅ Finish' : '➡️ Answer & Next')}
                  </button>
                </div>
              </div>
            )}

            {currentQuestionIndex >= currentQuestions.length && (
              <div className="phase-complete">
                <div className="completion-message">
                  <h5>🎉 {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase Complete!</h5>
                  <p>You can switch to another phase or check the Theory tab to see what I've learned.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {currentTab === 'theory' && (
        <div className="theory-content">
          <div className="theory-header">
            <h4>🧠 My Understanding (Theory)</h4>
            <p>
              Based on our interaction, here's what I understand about your preferences. 
              You can remove any statements that are incorrect.
            </p>
          </div>

          <div className="theory-list">
            {theoryStatements.length === 0 ? (
              <div className="no-theory">
                <p>No theory statements yet. Please answer some questions in the Review tab to build my understanding.</p>
              </div>
            ) : (
              theoryStatements.map((statement) => (
                <div key={statement.id} className="theory-statement">
                  <div className="statement-content">
                    <div className="statement-category">{statement.category}</div>
                    <div className="statement-text">{statement.statement}</div>
                    <div className="statement-confidence">
                      Confidence: {Math.round(statement.confidence * 100)}%
                    </div>
                  </div>
                  <button 
                    className="remove-statement-btn"
                    onClick={() => removeTheoryStatement(statement.id)}
                    title="Remove this statement"
                  >
                    ❌
                  </button>
                </div>
              ))
            )}
          </div>

          {theoryStatements.length > 0 && (
            <div className="theory-actions">
              <button 
                className="apply-theory-btn"
                onClick={applyTheoryToNotes}
                disabled={isIterating}
              >
                {isIterating ? (
                  <>
                    <div className="loading-spinner"></div>
                    Applying Theory...
                  </>
                ) : (
                  '🚀 Apply Theory to Notes'
                )}
              </button>
            </div>
          )}

          {isIterating && (
            <div className="iteration-loading">
              <div className="loading-message">
                <div className="loading-spinner-large"></div>
                <p>Applying my understanding to enhance your notes...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InteractiveReview
