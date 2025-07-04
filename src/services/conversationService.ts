import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface TheoryStatement {
  id: string
  category: string
  statement: string
  confidence: number
  source: string // Which phase/question generated this
}

export interface PhaseResponse {
  question: string
  answer: string | string[]
  questionId: string
}

export type ReviewPhase = 'metadata' | 'verification' | 'customization'

export interface EnhancedConversationState {
  messages: ConversationMessage[]
  currentPhase: ReviewPhase
  theoryStatements: TheoryStatement[]
  isComplete: boolean
  phaseResponses: Record<ReviewPhase, PhaseResponse[]>
}

export interface ConversationState {
  messages: ConversationMessage[]
  currentTopic: string | null
  suggestedImprovements: string[]
  isComplete: boolean
  reviewPhase: 'initial' | 'questioning' | 'refining' | 'finalizing'
  // Enhanced properties
  currentPhase?: ReviewPhase
  theoryStatements?: TheoryStatement[]
  phaseResponses?: Record<ReviewPhase, PhaseResponse[]>
}

export class ConversationAgent {
  private genAI: GoogleGenerativeAI
  private state: ConversationState
  private originalText: string
  private improvedText: string

  constructor(apiKey: string, originalText: string, improvedText: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.originalText = originalText
    this.improvedText = improvedText
    this.state = {
      messages: [],
      currentTopic: null,
      suggestedImprovements: [],
      isComplete: false,
      reviewPhase: 'initial'
    }
  }

  getState(): ConversationState {
    return { ...this.state }
  }

  async startReview(): Promise<ConversationMessage> {
    const initialPrompt = `I'm an AI assistant helping you review and improve your transcribed notes. I've already created an improved version of your original text, but I'd like to work with you interactively to make it even better.

Let me analyze what I've done so far and ask you some questions to refine it further.

**Original text length:** ${this.originalText.length} characters
**Improved text length:** ${this.improvedText.length} characters

I'll ask you a few questions to understand your preferences and make targeted improvements. Shall we begin?

**First question:** What is the primary purpose of these notes? (e.g., study material, meeting minutes, research notes, lecture notes)`

    const message: ConversationMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: initialPrompt,
      timestamp: new Date()
    }

    this.state.messages.push(message)
    this.state.reviewPhase = 'questioning'
    
    return message
  }

  async processUserResponse(userInput: string): Promise<ConversationMessage> {
    // Add user message to conversation
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    }
    this.state.messages.push(userMessage)

    // Generate AI response based on current phase and conversation history
    const aiResponse = await this.generateContextualResponse(userInput)
    
    const aiMessage: ConversationMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    }
    this.state.messages.push(aiMessage)

    return aiMessage
  }

  private async generateContextualResponse(userInput: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    const conversationHistory = this.state.messages
      .slice(-6) // Keep last 6 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n')

    let systemPrompt = ''
    
    switch (this.state.reviewPhase) {
      case 'questioning':
        systemPrompt = `You are an AI assistant helping to improve transcribed notes through interactive conversation. 

CURRENT PHASE: Asking clarifying questions to understand user preferences.

CONVERSATION SO FAR:
${conversationHistory}

USER'S LATEST INPUT: ${userInput}

ORIGINAL TEXT (first 500 chars): ${this.originalText.substring(0, 500)}...

IMPROVED TEXT (first 500 chars): ${this.improvedText.substring(0, 500)}...

Based on the user's response, ask ONE follow-up question to better understand their needs. Choose from these types of questions:
1. Structure preferences (bullet points, paragraphs, headings)
2. Level of detail (concise vs comprehensive)
3. Specific topics to emphasize or de-emphasize
4. Target audience or use case
5. Formatting preferences

After 3-4 questions, move to the refining phase by saying "Great! Based on your preferences, let me suggest some specific improvements..."

Keep responses conversational and helpful. Maximum 3 sentences.`
        break;

      case 'refining':
        systemPrompt = `You are an AI assistant in the REFINING phase of note improvement.

CONVERSATION HISTORY:
${conversationHistory}

USER'S LATEST INPUT: ${userInput}

ORIGINAL TEXT: ${this.originalText}

CURRENT IMPROVED VERSION: ${this.improvedText}

Based on the conversation, provide 2-3 SPECIFIC improvement suggestions for the notes. For each suggestion:
1. Explain what you'd change
2. Why it would be better
3. Ask if they want you to implement it

Format as:
**Suggestion 1:** [Description]
*Why:* [Reason]
*Implement this change?* (Yes/No)

Keep it focused and actionable.`
        this.state.reviewPhase = 'finalizing'
        break;

      case 'finalizing':
        systemPrompt = `You are in the FINALIZING phase. The user has provided feedback on suggestions.

CONVERSATION HISTORY:
${conversationHistory}

USER'S LATEST INPUT: ${userInput}

If the user approved changes, acknowledge them and ask if they want any other modifications.
If they're satisfied, congratulate them and suggest they can download the final version.
Keep responses brief and positive.`
        break;
    }

    try {
      const result = await model.generateContent(systemPrompt)
      const response = result.response
      return response.text()
    } catch (error) {
      console.error('Error generating AI response:', error)
      return "I apologize, but I'm having trouble processing that. Could you please try again?"
    }
  }

  async iterateOnText(currentEditorText: string): Promise<{ newText: string; changes: string[] }> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    const conversationSummary = this.state.messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n- ')

    const prompt = `Based on our conversation, please improve the current text in the editor. 

ORIGINAL PDF TEXT:
${this.originalText}

CURRENT EDITOR TEXT:
${currentEditorText}

USER'S FEEDBACK AND PREFERENCES FROM OUR CONVERSATION:
- ${conversationSummary}

Please provide:
1. An improved version of the current editor text incorporating the user's feedback
2. A list of specific changes you made

Format your response EXACTLY like this:

===IMPROVED_TEXT===
[Put the improved text here]

===CHANGES_MADE===
- [Change 1]
- [Change 2]
- [Change 3]

Make sure to incorporate the user's preferences and feedback while maintaining the content quality and structure.`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response.text()

      // Parse the response
      const improvedMatch = response.match(/===IMPROVED_TEXT===\s*([\s\S]*?)\s*===CHANGES_MADE===/)?.[1]?.trim()
      const changesMatch = response.match(/===CHANGES_MADE===\s*([\s\S]*?)(?:$|\n\n===)/)?.[1]?.trim()

      if (!improvedMatch) {
        throw new Error('Could not parse improved text')
      }

      const changes = changesMatch 
        ? changesMatch.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim())
        : ['Text improved based on conversation']

      // Update our internal improved text
      this.improvedText = improvedMatch

      return {
        newText: improvedMatch,
        changes
      }
    } catch (error) {
      console.error('Error iterating on text:', error)
      throw new Error('Failed to iterate on text. Please try again.')
    }
  }

  getImprovedText(): string {
    return this.improvedText
  }

  markComplete(): void {
    this.state.isComplete = true
  }
}

export class EnhancedConversationAgent {
  private genAI: GoogleGenerativeAI
  private state: EnhancedConversationState
  private originalText: string
  private improvedText: string

  constructor(apiKey: string, originalText: string, improvedText: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.originalText = originalText
    this.improvedText = improvedText
    this.state = {
      messages: [],
      currentPhase: 'metadata',
      theoryStatements: [],
      isComplete: false,
      phaseResponses: {
        metadata: [],
        verification: [],
        customization: []
      }
    }
  }

  getState(): EnhancedConversationState {
    return { ...this.state }
  }

  async initializeReview(): Promise<void> {
    const welcomeMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Welcome to the Smart Interactive Review! I\'ll help you create the perfect notes by understanding your preferences and building a theory about how you like your content structured.',
      timestamp: new Date()
    }
    this.state.messages.push(welcomeMessage)
  }

  async processPhaseResponses(phase: ReviewPhase, responses: PhaseResponse[]): Promise<void> {
    // Store responses for this phase
    this.state.phaseResponses[phase] = responses
    
    // Generate theory statements based on responses
    const newStatements = await this.generateTheoryStatements(phase, responses)
    
    // Add new statements to existing ones
    this.state.theoryStatements.push(...newStatements)
    
    // Add a message about the processing
    const processingMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Thank you for your responses to the ${phase} questions. I've updated my understanding and generated ${newStatements.length} new theory statements.`,
      timestamp: new Date()
    }
    this.state.messages.push(processingMessage)
  }

  private async generateTheoryStatements(phase: ReviewPhase, responses: PhaseResponse[]): Promise<TheoryStatement[]> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    const responseText = responses.map(r => `Q: ${r.question}\nA: ${Array.isArray(r.answer) ? r.answer.join(', ') : r.answer}`).join('\n\n')
    
    const prompt = `Based on the user's responses to ${phase} questions, generate theory statements about their preferences for note-taking and content organization.

PHASE: ${phase}
USER RESPONSES:
${responseText}

ORIGINAL TEXT SAMPLE (first 300 chars): ${this.originalText.substring(0, 300)}...

Generate 2-4 theory statements in the following JSON format:
[
  {
    "category": "Structure",
    "statement": "User prefers bullet points for easy scanning",
    "confidence": 0.9,
    "source": "metadata_format_question"
  }
]

Categories should be one of: Structure, Content, Style, Purpose, Detail Level, Organization

Make statements specific and actionable. Confidence should be between 0.1 and 1.0 based on how certain you are about the preference.

Return ONLY the JSON array, no other text.`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response.text()
      
      // Parse JSON response
      const statements = JSON.parse(response)
      
      return statements.map((stmt: any, index: number) => ({
        id: `${phase}_${Date.now()}_${index}`,
        category: stmt.category,
        statement: stmt.statement,
        confidence: stmt.confidence,
        source: stmt.source
      }))
    } catch (error) {
      console.error('Error generating theory statements:', error)
      return []
    }
  }

  async removeTheoryStatement(statementId: string): Promise<void> {
    const beforeCount = this.state.theoryStatements.length
    const beforeIds = this.state.theoryStatements.map(s => s.id)
    
    this.state.theoryStatements = this.state.theoryStatements.filter(stmt => stmt.id !== statementId)
    
    const afterCount = this.state.theoryStatements.length
    const afterIds = this.state.theoryStatements.map(s => s.id)
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Theory statement removal:', {
        statementId,
        beforeCount,
        afterCount,
        beforeIds,
        afterIds,
        removed: beforeCount !== afterCount
      })
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      console.error('Error generating response:', error)
      return 'Sorry, I couldn\'t generate a response at this time.'
    }
  }

  async applyTheoryToText(currentText: string): Promise<{ newText: string; changes: string[] }> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    const theoryText = this.state.theoryStatements
      .map(stmt => `${stmt.category}: ${stmt.statement} (Confidence: ${Math.round(stmt.confidence * 100)}%)`)
      .join('\n')
    
    const allResponses = Object.entries(this.state.phaseResponses)
      .flatMap(([phase, responses]) => 
        responses.map(r => `[${phase}] ${r.question}: ${Array.isArray(r.answer) ? r.answer.join(', ') : r.answer}`)
      )
      .join('\n')

    const prompt = `Apply the user's preferences to improve their notes based on our interactive review.

ORIGINAL PDF TEXT:
${this.originalText}

CURRENT TEXT TO IMPROVE:
${currentText}

USER'S THEORY (My Understanding):
${theoryText}

DETAILED USER RESPONSES:
${allResponses}

Please provide:
1. An improved version of the current text that incorporates all the user's preferences from the theory
2. A list of specific changes made

Format your response EXACTLY like this:

===IMPROVED_TEXT===
[Put the improved text here]

===CHANGES_MADE===
- [Change 1]
- [Change 2]
- [Change 3]

Apply ALL theory statements where relevant. Make substantial improvements based on their preferences.`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response.text()

      // Parse the response
      const improvedMatch = response.match(/===IMPROVED_TEXT===\s*([\s\S]*?)\s*===CHANGES_MADE===/)?.[1]?.trim()
      const changesMatch = response.match(/===CHANGES_MADE===\s*([\s\S]*?)(?:$|\n\n===)/)?.[1]?.trim()

      if (!improvedMatch) {
        throw new Error('Could not parse improved text')
      }

      const changes = changesMatch 
        ? changesMatch.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim())
        : ['Text improved based on theory']

      this.improvedText = improvedMatch

      return {
        newText: this.improvedText,
        changes
      }
    } catch (error) {
      console.error('Error applying theory to text:', error)
      throw new Error('Failed to apply theory. Please try again.')
    }
  }

  getImprovedText(): string {
    return this.improvedText
  }

  markComplete(): void {
    this.state.isComplete = true
  }
}
