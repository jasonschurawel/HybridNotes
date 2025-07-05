import React, { useState, useEffect, useRef, useCallback } from 'react'
import { EnhancedConversationAgent, localization } from '../services/conversationService'
import type { EnhancedConversationState, TheoryStatement, ReviewPhase } from '../services/conversationService'
import type { Language } from '../services/geminiService'
import './InteractiveReview.css'

// Helper function to get localized strings
const getLocalizedStrings = (language: Language) => {
  return localization[language] || localization.english
}

interface InteractiveReviewProps {
  originalText: string
  improvedText: string
  apiKey: string
  language: Language
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

// Language-specific question sets
const getQuestionSets = (language: Language): Record<ReviewPhase, PhaseQuestion[]> => {
  const questionSets: Partial<Record<Language, Record<ReviewPhase, PhaseQuestion[]>>> = {
    english: {
      metadata: [
        {
          id: 'document_type',
          question: 'What type of document is this?',
          type: 'select',
          options: [
            { id: 'lecture', text: '🎓 Lecture Notes', value: 'lecture' },
            { id: 'meeting', text: '💼 Meeting Minutes', value: 'meeting' },
            { id: 'research', text: '🔬 Research Notes', value: 'research' },
            { id: 'book', text: '📚 Book/Article Summary', value: 'book' },
            { id: 'personal', text: '📝 Personal Notes', value: 'personal' },
            { id: 'other', text: '📄 Other', value: 'other' }
          ],
          required: true
        },
        {
          id: 'target_audience',
          question: 'Who will be reading these notes?',
          type: 'select',
          options: [
            { id: 'myself', text: '👤 Just me', value: 'myself' },
            { id: 'team', text: '👥 My team/colleagues', value: 'team' },
            { id: 'students', text: '🎓 Students', value: 'students' },
            { id: 'clients', text: '💼 Clients/stakeholders', value: 'clients' },
            { id: 'public', text: '🌐 General public', value: 'public' }
          ],
          required: true
        },
        {
          id: 'primary_purpose',
          question: 'What\'s the main purpose of these notes?',
          type: 'select',
          options: [
            { id: 'study', text: '📖 Study/Review', value: 'study' },
            { id: 'reference', text: '📋 Quick Reference', value: 'reference' },
            { id: 'action', text: '✅ Action Items', value: 'action' },
            { id: 'knowledge', text: '🧠 Knowledge Base', value: 'knowledge' },
            { id: 'sharing', text: '🤝 Sharing Information', value: 'sharing' }
          ],
          required: true
        }
      ],
      verification: [
        {
          id: 'content_accuracy',
          question: 'How accurate is the transcribed content compared to the original?',
          type: 'select',
          options: [
            { id: 'excellent', text: '✅ Excellent - Very accurate', value: 'excellent' },
            { id: 'good', text: '👍 Good - Mostly accurate', value: 'good' },
            { id: 'fair', text: '⚠️ Fair - Some inaccuracies', value: 'fair' },
            { id: 'poor', text: '❌ Poor - Many errors', value: 'poor' }
          ],
          required: true
        },
        {
          id: 'missing_content',
          question: 'Is there any important content missing or unclear?',
          type: 'text',
          required: false
        },
        {
          id: 'priority_topics',
          question: 'Which topics should be emphasized more?',
          type: 'text',
          required: false
        }
      ],
      customization: [
        {
          id: 'preferred_format',
          question: 'How do you prefer your notes to be formatted?',
          type: 'multiselect',
          options: [
            { id: 'bullets', text: '• Bullet points', value: 'bullets' },
            { id: 'numbered', text: '1. Numbered lists', value: 'numbered' },
            { id: 'headings', text: '📋 Clear headings', value: 'headings' },
            { id: 'paragraphs', text: '📄 Paragraphs', value: 'paragraphs' },
            { id: 'tables', text: '📊 Tables/charts', value: 'tables' },
            { id: 'summaries', text: '📝 Section summaries', value: 'summaries' }
          ],
          required: true
        },
        {
          id: 'detail_level',
          question: 'How detailed should the notes be?',
          type: 'select',
          options: [
            { id: 'minimal', text: '🎯 Minimal - Key points only', value: 'minimal' },
            { id: 'moderate', text: '📋 Moderate - Main ideas + details', value: 'moderate' },
            { id: 'comprehensive', text: '📚 Comprehensive - Everything important', value: 'comprehensive' }
          ],
          required: true
        },
        {
          id: 'special_requirements',
          question: 'Any special formatting or style requirements?',
          type: 'text',
          required: false
        }
      ]
    },
    german: {
      metadata: [
        {
          id: 'document_type',
          question: 'Welche Art von Dokument ist das?',
          type: 'select',
          options: [
            { id: 'lecture', text: '🎓 Vorlesungsnotizen', value: 'lecture' },
            { id: 'meeting', text: '💼 Besprechungsprotokoll', value: 'meeting' },
            { id: 'research', text: '🔬 Forschungsnotizen', value: 'research' },
            { id: 'book', text: '📚 Buch-/Artikelzusammenfassung', value: 'book' },
            { id: 'personal', text: '📝 Persönliche Notizen', value: 'personal' },
            { id: 'other', text: '📄 Andere', value: 'other' }
          ],
          required: true
        },
        {
          id: 'target_audience',
          question: 'Wer wird diese Notizen lesen?',
          type: 'select',
          options: [
            { id: 'myself', text: '👤 Nur ich', value: 'myself' },
            { id: 'team', text: '👥 Mein Team/Kollegen', value: 'team' },
            { id: 'students', text: '🎓 Studenten', value: 'students' },
            { id: 'clients', text: '💼 Kunden/Stakeholder', value: 'clients' },
            { id: 'public', text: '🌐 Allgemeine Öffentlichkeit', value: 'public' }
          ],
          required: true
        },
        {
          id: 'primary_purpose',
          question: 'Was ist der Hauptzweck dieser Notizen?',
          type: 'select',
          options: [
            { id: 'study', text: '📖 Lernen/Wiederholen', value: 'study' },
            { id: 'reference', text: '📋 Schnelle Referenz', value: 'reference' },
            { id: 'action', text: '✅ Aufgaben', value: 'action' },
            { id: 'knowledge', text: '🧠 Wissensbasis', value: 'knowledge' },
            { id: 'sharing', text: '🤝 Informationen teilen', value: 'sharing' }
          ],
          required: true
        }
      ],
      verification: [
        {
          id: 'content_accuracy',
          question: 'Wie genau ist der transkribierte Inhalt im Vergleich zum Original?',
          type: 'select',
          options: [
            { id: 'excellent', text: '✅ Ausgezeichnet - Sehr genau', value: 'excellent' },
            { id: 'good', text: '👍 Gut - Meist genau', value: 'good' },
            { id: 'fair', text: '⚠️ Mittelmäßig - Einige Ungenauigkeiten', value: 'fair' },
            { id: 'poor', text: '❌ Schlecht - Viele Fehler', value: 'poor' }
          ],
          required: true
        },
        {
          id: 'missing_content',
          question: 'Gibt es wichtige Inhalte, die fehlen oder unklar sind?',
          type: 'text',
          required: false
        },
        {
          id: 'priority_topics',
          question: 'Welche Themen sollten stärker betont werden?',
          type: 'text',
          required: false
        }
      ],
      customization: [
        {
          id: 'preferred_format',
          question: 'Wie möchten Sie Ihre Notizen formatiert haben?',
          type: 'multiselect',
          options: [
            { id: 'bullets', text: '• Aufzählungspunkte', value: 'bullets' },
            { id: 'numbered', text: '1. Nummerierte Listen', value: 'numbered' },
            { id: 'headings', text: '📋 Klare Überschriften', value: 'headings' },
            { id: 'paragraphs', text: '📄 Absätze', value: 'paragraphs' },
            { id: 'tables', text: '📊 Tabellen/Diagramme', value: 'tables' },
            { id: 'summaries', text: '📝 Abschnittszusammenfassungen', value: 'summaries' }
          ],
          required: true
        },
        {
          id: 'detail_level',
          question: 'Wie detailliert sollen die Notizen sein?',
          type: 'select',
          options: [
            { id: 'minimal', text: '🎯 Minimal - Nur Kernpunkte', value: 'minimal' },
            { id: 'moderate', text: '📋 Moderat - Hauptideen + Details', value: 'moderate' },
            { id: 'comprehensive', text: '📚 Umfassend - Alles Wichtige', value: 'comprehensive' }
          ],
          required: true
        },
        {
          id: 'special_requirements',
          question: 'Besondere Formatierungs- oder Stilanforderungen?',
          type: 'text',
          required: false
        }
      ]
    },
    french: {
      metadata: [
        {
          id: 'document_type',
          question: 'Quel type de document est-ce ?',
          type: 'select',
          options: [
            { id: 'lecture', text: '🎓 Notes de cours', value: 'lecture' },
            { id: 'meeting', text: '💼 Procès-verbal de réunion', value: 'meeting' },
            { id: 'research', text: '🔬 Notes de recherche', value: 'research' },
            { id: 'book', text: '📚 Résumé de livre/article', value: 'book' },
            { id: 'personal', text: '📝 Notes personnelles', value: 'personal' },
            { id: 'other', text: '📄 Autre', value: 'other' }
          ],
          required: true
        },
        {
          id: 'target_audience',
          question: 'Qui va lire ces notes ?',
          type: 'select',
          options: [
            { id: 'myself', text: '👤 Juste moi', value: 'myself' },
            { id: 'team', text: '👥 Mon équipe/collègues', value: 'team' },
            { id: 'students', text: '🎓 Étudiants', value: 'students' },
            { id: 'clients', text: '💼 Clients/parties prenantes', value: 'clients' },
            { id: 'public', text: '🌐 Grand public', value: 'public' }
          ],
          required: true
        },
        {
          id: 'primary_purpose',
          question: 'Quel est l\'objectif principal de ces notes ?',
          type: 'select',
          options: [
            { id: 'study', text: '📖 Étude/Révision', value: 'study' },
            { id: 'reference', text: '📋 Référence rapide', value: 'reference' },
            { id: 'action', text: '✅ Éléments d\'action', value: 'action' },
            { id: 'knowledge', text: '🧠 Base de connaissances', value: 'knowledge' },
            { id: 'sharing', text: '🤝 Partage d\'informations', value: 'sharing' }
          ],
          required: true
        }
      ],
      verification: [
        {
          id: 'content_accuracy',
          question: 'Quelle est la précision du contenu transcrit par rapport à l\'original ?',
          type: 'select',
          options: [
            { id: 'excellent', text: '✅ Excellent - Très précis', value: 'excellent' },
            { id: 'good', text: '👍 Bon - Principalement précis', value: 'good' },
            { id: 'fair', text: '⚠️ Correct - Quelques imprécisions', value: 'fair' },
            { id: 'poor', text: '❌ Médiocre - Beaucoup d\'erreurs', value: 'poor' }
          ],
          required: true
        },
        {
          id: 'missing_content',
          question: 'Y a-t-il du contenu important manquant ou peu clair ?',
          type: 'text',
          required: false
        },
        {
          id: 'priority_topics',
          question: 'Quels sujets devraient être davantage mis en évidence ?',
          type: 'text',
          required: false
        }
      ],
      customization: [
        {
          id: 'preferred_format',
          question: 'Comment préférez-vous que vos notes soient formatées ?',
          type: 'multiselect',
          options: [
            { id: 'bullets', text: '• Points à puces', value: 'bullets' },
            { id: 'numbered', text: '1. Listes numérotées', value: 'numbered' },
            { id: 'headings', text: '📋 Titres clairs', value: 'headings' },
            { id: 'paragraphs', text: '📄 Paragraphes', value: 'paragraphs' },
            { id: 'tables', text: '📊 Tableaux/graphiques', value: 'tables' },
            { id: 'summaries', text: '📝 Résumés de section', value: 'summaries' }
          ],
          required: true
        },
        {
          id: 'detail_level',
          question: 'Quel niveau de détail pour les notes ?',
          type: 'select',
          options: [
            { id: 'minimal', text: '🎯 Minimal - Points clés seulement', value: 'minimal' },
            { id: 'moderate', text: '📋 Modéré - Idées principales + détails', value: 'moderate' },
            { id: 'comprehensive', text: '📚 Complet - Tout ce qui est important', value: 'comprehensive' }
          ],
          required: true
        },
        {
          id: 'special_requirements',
          question: 'Exigences spéciales de formatage ou de style ?',
          type: 'text',
          required: false
        }
      ]
    },
    // Add simplified question sets for other languages (using English structure with translated text)
    spanish: {
      metadata: [
        { id: 'document_type', question: '¿Qué tipo de documento es este?', type: 'select', options: [{ id: 'lecture', text: '🎓 Notas de clase', value: 'lecture' }, { id: 'meeting', text: '💼 Actas de reunión', value: 'meeting' }, { id: 'research', text: '🔬 Notas de investigación', value: 'research' }, { id: 'book', text: '📚 Resumen de libro/artículo', value: 'book' }, { id: 'personal', text: '📝 Notas personales', value: 'personal' }, { id: 'other', text: '📄 Otro', value: 'other' }], required: true },
        { id: 'target_audience', question: '¿Quién leerá estas notas?', type: 'select', options: [{ id: 'myself', text: '👤 Solo yo', value: 'myself' }, { id: 'team', text: '👥 Mi equipo/colegas', value: 'team' }, { id: 'students', text: '🎓 Estudiantes', value: 'students' }, { id: 'clients', text: '💼 Clientes/interesados', value: 'clients' }, { id: 'public', text: '🌐 Público general', value: 'public' }], required: true },
        { id: 'primary_purpose', question: '¿Cuál es el propósito principal de estas notas?', type: 'select', options: [{ id: 'study', text: '📖 Estudio/Repaso', value: 'study' }, { id: 'reference', text: '📋 Referencia rápida', value: 'reference' }, { id: 'action', text: '✅ Elementos de acción', value: 'action' }, { id: 'knowledge', text: '🧠 Base de conocimiento', value: 'knowledge' }, { id: 'sharing', text: '🤝 Compartir información', value: 'sharing' }], required: true }
      ],
      verification: [
        { id: 'content_accuracy', question: '¿Qué tan preciso es el contenido transcrito comparado con el original?', type: 'select', options: [{ id: 'excellent', text: '✅ Excelente - Muy preciso', value: 'excellent' }, { id: 'good', text: '👍 Bueno - Principalmente preciso', value: 'good' }, { id: 'fair', text: '⚠️ Regular - Algunas imprecisiones', value: 'fair' }, { id: 'poor', text: '❌ Malo - Muchos errores', value: 'poor' }], required: true },
        { id: 'missing_content', question: '¿Hay algún contenido importante que falte o no esté claro?', type: 'text', required: false },
        { id: 'priority_topics', question: '¿Qué temas deberían enfatizarse más?', type: 'text', required: false }
      ],
      customization: [
        { id: 'preferred_format', question: '¿Cómo prefieres que se formateen tus notas?', type: 'multiselect', options: [{ id: 'bullets', text: '• Viñetas', value: 'bullets' }, { id: 'numbered', text: '1. Listas numeradas', value: 'numbered' }, { id: 'headings', text: '📋 Encabezados claros', value: 'headings' }, { id: 'paragraphs', text: '📄 Párrafos', value: 'paragraphs' }, { id: 'tables', text: '📊 Tablas/gráficos', value: 'tables' }, { id: 'summaries', text: '📝 Resúmenes de sección', value: 'summaries' }], required: true },
        { id: 'detail_level', question: '¿Qué tan detalladas deben ser las notas?', type: 'select', options: [{ id: 'minimal', text: '🎯 Mínimo - Solo puntos clave', value: 'minimal' }, { id: 'moderate', text: '📋 Moderado - Ideas principales + detalles', value: 'moderate' }, { id: 'comprehensive', text: '📚 Completo - Todo lo importante', value: 'comprehensive' }], required: true },
        { id: 'special_requirements', question: '¿Algún requisito especial de formato o estilo?', type: 'text', required: false }
      ]
    }
  }

  // For languages not fully translated, use English as fallback
  return questionSets[language] || questionSets.english!
}

const InteractiveReview: React.FC<InteractiveReviewProps> = ({
  originalText,
  improvedText,
  apiKey,
  language,
  currentEditorText,
  onIterationProposed
}) => {
  // Get localized strings for this component
  const localizedStrings = getLocalizedStrings(language)
  
  // Fallback to English UI texts if not available for current language
  const uiTexts = localizedStrings.uiTexts || getLocalizedStrings('english').uiTexts!
  
  // Fallback to English phase headers if not available for current language
  const phaseHeaders = localizedStrings.uiTexts?.phaseHeaders || getLocalizedStrings('english').uiTexts!.phaseHeaders!
  
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
  const [showCorrectionChoice, setShowCorrectionChoice] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (apiKey && originalText && improvedText) {
      const newAgent = new EnhancedConversationAgent(apiKey, originalText, improvedText, language)
      setAgent(newAgent)
      // Auto-start the review when agent is ready
      initializeReview(newAgent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, originalText, improvedText, language])

  const initializeReview = useCallback(async (agentToUse: EnhancedConversationAgent) => {
    setIsLoading(true)
    try {
      await agentToUse.initializeReview()
      setConversation(agentToUse.getState())
      const questionSets = getQuestionSets(language)
      const questions = questionSets.metadata
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  useEffect(() => {
    if (!isIterating) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation?.messages, isLoading, isIterating])

  const generateSuggestionsForTextQuestion = useCallback(async (question: PhaseQuestion) => {
    if (!agent || question.type !== 'text') return

    setIsGeneratingSuggestions(true)
    try {
      // Include more context from the original transcribed notes
      const originalTextPreview = originalText.substring(0, 2000) // Use more content for better context
      
      const prompt = `Based on the following transcribed PDF content and the question, generate 4-5 relevant, specific answer options that would be appropriate for these particular notes.

ORIGINAL TRANSCRIBED CONTENT:
"${originalTextPreview}${originalText.length > 2000 ? '...[content continues]' : ''}"

QUESTION: ${question.question}

Analyze the content above and provide contextual, specific answers that make sense for this particular document. Generate answers based on what you can understand from the actual transcribed content.

IMPORTANT: Return ONLY a valid JSON array of strings. No additional text, no markdown formatting, no explanations.

Example format:
["Option 1 text", "Option 2 text", "Option 3 text", "Option 4 text"]`
      
      const response = await agent.generateResponse(prompt)
      
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = response.trim()
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      // Try to parse the response as JSON
      try {
        const suggestions = JSON.parse(cleanedResponse)
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          const options = suggestions.slice(0, 5).map((suggestion, index) => ({
            id: `suggestion-${index}`,
            text: String(suggestion).trim(),
            value: String(suggestion).trim()
          }))
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
          setSuggestedOptions(options)
        } else {
          // Final fallback - provide generic suggestions based on question type
          const fallbackOptions = getFallbackSuggestions(question.question)
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
  }, [agent, originalText])

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
    const questionSets = getQuestionSets(language)
    const questions = questionSets[phase]
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

  const handleAnswerChange = (value: string | string[]) => {
    setCurrentAnswer(value)
    
    // Auto-submit if this is a button selection (not custom text input)
    if (!showCustomInput && value) {
      // Use setTimeout to ensure state is updated first, and pass the value directly
      setTimeout(() => {
        handleAnswerSubmitWithValue(value)
      }, 100)
    }
  }

  const handleAnswerSubmitWithValue = async (answerValue: string | string[]) => {
    if (!agent || currentQuestionIndex >= currentQuestions.length) return

    const currentQuestion = currentQuestions[currentQuestionIndex]
    
    // Store the answer
    setPhaseAnswers(prev => ({
      ...prev,
      [currentPhase]: {
        ...prev[currentPhase],
        [currentQuestion.id]: answerValue
      }
    }))

    setIsLoading(true)
    try {
      // Process this single answer immediately into issues identification
      const response = {
        question: currentQuestion.question,
        answer: Array.isArray(answerValue) ? answerValue.join(', ') : answerValue,
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
    } else {
      // Current phase is complete, auto-advance to next phase
      autoAdvancePhase()
    }
  }

  const autoAdvancePhase = () => {
    const phases: ReviewPhase[] = ['metadata', 'verification', 'customization']
    const currentIndex = phases.indexOf(currentPhase)
    
    if (currentIndex < phases.length - 1) {
      // Move to next phase
      const nextPhase = phases[currentIndex + 1]
      setCurrentPhase(nextPhase)
      const questionSets = getQuestionSets(language)
      const questions = questionSets[nextPhase]
      setCurrentQuestions(questions)
      setCurrentQuestionIndex(0)
      setCurrentAnswer('')
      setSuggestedOptions([])
      setShowCustomInput(false)
      
      // Generate suggestions for the first question if it's a text question
      if (questions[0] && questions[0].type === 'text') {
        generateSuggestionsForTextQuestion(questions[0])
      }
    } else {
      // All phases complete, switch to Correct tab
      setCurrentTab('theory')
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

  const removeIssueStatement = async (statementId: string) => {
    if (!agent) return

    try {
      // Get current state before modification
      const currentState = agent.getState()
      const currentStatements = currentState.theoryStatements || []
      
      // Check if statement exists
      const statementExists = currentStatements.find(stmt => stmt.id === statementId)
      if (!statementExists) {
        console.warn('Statement not found:', statementId)
        return
      }
      
      // Remove the statement from service
      await agent.removeTheoryStatement(statementId)
      
      // Get updated state and verify the removal
      const updatedState = agent.getState()
      const updatedStatements = updatedState.theoryStatements || []
      
      // Use functional updates to ensure proper state isolation
      setTheoryStatements(() => {
        // Create completely new array to avoid any reference issues
        return updatedStatements.map(stmt => ({ ...stmt }))
      })
      
      setConversation(() => ({ 
        ...updatedState,
        theoryStatements: updatedStatements.map(stmt => ({ ...stmt }))
      }))
      
    } catch (error) {
      console.error('Error removing issue statement:', error)
      // Refresh the issue statements from the service on error
      try {
        const fallbackState = agent.getState()
        setTheoryStatements(fallbackState.theoryStatements?.map(stmt => ({ ...stmt })) || [])
      } catch (fallbackError) {
        console.error('Error refreshing issue statements:', fallbackError)
      }
    }
  }

  const applyCorrectionsToEditor = async (useOriginalAsBase: boolean = false) => {
    if (!agent || !onIterationProposed) return
    
    setIsIterating(true)
    setShowCorrectionChoice(false)
    
    // Auto-scroll down when starting to apply changes
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 100)
    
    try {
      const result = await agent.applyTheoryToTextWithChoice(currentEditorText || improvedText, useOriginalAsBase)
      onIterationProposed(result)
    } catch (error) {
      console.error('Error applying theory:', error)
    } finally {
      setIsIterating(false)
      
      // Scroll up when finished (keeping existing behavior)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
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
                onClick={() => handleAnswerChange(option.value)}
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
                    handleAnswerChange(currentAnswers.filter(a => a !== option.value))
                  } else {
                    handleAnswerChange([...currentAnswers, option.value])
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
                <span>{uiTexts.generatingSuggestions}</span>
              </div>
            )}
            
            {suggestedOptions.length > 0 && !showCustomInput && (
              <div className="suggested-options">
                <p className="suggestions-label">💡 {uiTexts.suggestedAnswers}</p>
                <div className="question-buttons">
                  {suggestedOptions.map(option => (
                    <button
                      key={option.id}
                      className={`option-btn ${currentAnswer === option.value ? 'selected' : ''}`}
                      onClick={() => handleAnswerChange(option.value)}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
                <button 
                  className="custom-input-btn"
                  onClick={() => setShowCustomInput(true)}
                >
                  ✏️ {uiTexts.customOption}
                </button>
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
                    ⬅️ {uiTexts.backToSuggestions}
                  </button>
                )}
                <textarea
                  value={currentAnswer as string || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
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
            {localizedStrings.buttonLabels.correct} ({theoryStatements.length})
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
                📋 {localizedStrings.phaseNames.metadata}
              </button>
              <button 
                className={`segment-btn ${currentPhase === 'verification' ? 'active' : ''}`}
                onClick={() => switchPhase('verification')}
              >
                🔍 {localizedStrings.phaseNames.verification}
              </button>
              <button 
                className={`segment-btn ${currentPhase === 'customization' ? 'active' : ''}`}
                onClick={() => switchPhase('customization')}
              >
                🎨 {localizedStrings.phaseNames.customization}
              </button>
            </div>
          </div>

          <div className="phase-content">
            <div className="phase-header">
              <h4>
                {currentPhase === 'metadata' && `📋 ${phaseHeaders.metadata.title}`}
                {currentPhase === 'verification' && `🔍 ${phaseHeaders.verification.title}`}
                {currentPhase === 'customization' && `🎨 ${phaseHeaders.customization.title}`}
              </h4>
              <p>
                {currentPhase === 'metadata' && phaseHeaders.metadata.subtitle}
                {currentPhase === 'verification' && phaseHeaders.verification.subtitle}
                {currentPhase === 'customization' && phaseHeaders.customization.subtitle}
              </p>
            </div>

            <div className="question-progress">
              <div className="progress-indicator">
                {uiTexts.questionProgress.replace('{current}', (currentQuestionIndex + 1).toString()).replace('{total}', currentQuestions.length.toString())}
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
                    ⬅️ {localizedStrings.buttonLabels.back}
                  </button>
                  
                  <button 
                    className="action-btn skip-btn"
                    onClick={handleSkipQuestion}
                    disabled={isLoading}
                  >
                    ⏭️ {localizedStrings.buttonLabels.skip}
                  </button>
                  
                  {/* Only show Answer & Next button for custom text input or non-text questions */}
                  {(showCustomInput || getCurrentQuestion()?.type !== 'text') && (
                    <button 
                      className="action-btn answer-btn"
                      onClick={() => handleAnswerSubmitWithValue(currentAnswer)}
                      disabled={isLoading || (!currentAnswer && getCurrentQuestion()!.required)}
                    >
                      {isLoading ? uiTexts.processing : (isLastQuestion() ? `✅ ${uiTexts.finish}` : `➡️ ${uiTexts.answerNext}`)}
                    </button>
                  )}
                </div>
              </div>
            )}

            {currentQuestionIndex >= currentQuestions.length && (
              <div className="phase-complete">              <div className="completion-message">
                <h5>🎉 {uiTexts.phaseComplete.replace('{phase}', localizedStrings.phaseNames[currentPhase])}</h5>
                <p>{uiTexts.phaseCompleteDescription}</p>
              </div>
              </div>
            )}
          </div>
        </div>
      )}

      {currentTab === 'theory' && (
        <div className="theory-content">
          <div className="theory-header">
            <h4>{uiTexts.correctionsNeeded}</h4>
            <p>
              {uiTexts.correctionsDescription}
            </p>
          </div>

          <div className="theory-list">
            {theoryStatements.length === 0 ? (
              <div className="no-theory">
                <p>{uiTexts.noIssuesFound} {uiTexts.noIssuesDescription}</p>
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
                    onClick={() => removeIssueStatement(statement.id)}
                    title={uiTexts.removeTip}
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
                onClick={() => setShowCorrectionChoice(true)}
                disabled={isIterating}
              >
                {localizedStrings.buttonLabels.applyChanges}
              </button>
              
              {showCorrectionChoice && (
                <div className="correction-choice-modal">
                  <div className="choice-content">
                    <h5>{localizedStrings.modalTexts.correctionChoice.title}</h5>
                    <p>{localizedStrings.modalTexts.correctionChoice.description}</p>
                    
                    <div className="choice-buttons">
                      <button 
                        className="choice-btn primary"
                        onClick={() => applyCorrectionsToEditor(false)}
                      >
                        {localizedStrings.modalTexts.correctionChoice.fromCurrent}
                        <span className="choice-description">
                          {localizedStrings.modalTexts.correctionChoice.fromCurrentDesc}
                        </span>
                      </button>
                      
                      <button 
                        className="choice-btn secondary"
                        onClick={() => applyCorrectionsToEditor(true)}
                      >
                        {localizedStrings.modalTexts.correctionChoice.fromOriginal}
                        <span className="choice-description">
                          {localizedStrings.modalTexts.correctionChoice.fromOriginalDesc}
                        </span>
                      </button>
                    </div>
                    
                    <button 
                      className="cancel-choice-btn"
                      onClick={() => setShowCorrectionChoice(false)}
                    >
                      {localizedStrings.modalTexts.correctionChoice.cancel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isIterating && (
            <div className="iteration-loading">
              <div className="loading-message">
                <div className="loading-spinner-large"></div>
                <p>Applying corrections to your notes in the editor...</p>
                <p className="loading-detail">
                  {showCorrectionChoice ? 'Processing correction choice...' : 'This may take a moment while I incorporate all your preferences.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InteractiveReview
