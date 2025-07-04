import { GoogleGenerativeAI } from '@google/generative-ai'

export type Language = 'english' | 'german' | 'french' | 'russian'

const languageNames: Record<Language, string> = {
  english: 'English',
  german: 'German (Deutsch)',
  french: 'French (Français)',
  russian: 'Russian (Русский)'
}

// Load the job prompt from the job.txt file
const loadJobPrompt = async (language: Language): Promise<string> => {
  try {
    const response = await fetch('/job.txt')
    if (!response.ok) {
      throw new Error('Failed to load job prompt')
    }
    const basePrompt = await response.text()
    
    // Add language-specific instruction
    const languageInstruction = `\n\nIMPORTANT: Please provide the output in ${languageNames[language]}. Preserve the content's meaning while ensuring the language is natural and well-structured in ${languageNames[language]}.`
    
    return basePrompt + languageInstruction
  } catch (error) {
    console.error('Error loading job prompt:', error)
    // Fallback prompt if job.txt is not available
    return `You are an expert note improvement assistant. Please improve the following text by:
1. Enhancing grammar, spelling, and punctuation
2. Improving clarity and readability
3. Organizing content with proper structure
4. Using markdown formatting for better presentation
5. Maintaining the original meaning and context

IMPORTANT: Please provide the output in ${languageNames[language]}. Preserve the content's meaning while ensuring the language is natural and well-structured in ${languageNames[language]}.

Please process the following text and return improved, well-formatted notes:`
  }
}

// Convert file to base64 for Gemini API
const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1]
      resolve(base64String)
    }
    reader.readAsDataURL(file)
  })

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  }
}

export const improvePDFWithGemini = async (
  pdfFile: File, 
  apiKey: string,
  language: Language = 'english',
  additionalNotes: string = ''
): Promise<string> => {
  try {
    if (!apiKey.trim()) {
      throw new Error('API key is required')
    }

    if (!pdfFile) {
      throw new Error('PDF file is required')
    }

    // Verify it's a PDF file
    if (pdfFile.type !== 'application/pdf') {
      throw new Error('Please upload a valid PDF file')
    }

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Load the job prompt
    const jobPrompt = await loadJobPrompt(language)
    
    // Add additional user context if provided
    const fullPrompt = additionalNotes.trim() 
      ? `${jobPrompt}\n\nADDITIONAL USER INSTRUCTIONS:\n${additionalNotes.trim()}\n\nPlease incorporate these specific requirements into your improvement process.`
      : jobPrompt
    
    // Convert PDF to the format Gemini expects
    const pdfPart = await fileToGenerativePart(pdfFile)

    // Generate improved content with PDF and prompt
    const result = await model.generateContent([fullPrompt, pdfPart])
    const response = await result.response
    const improvedText = response.text()

    if (!improvedText || improvedText.trim().length === 0) {
      throw new Error('No improved text was generated')
    }

    return improvedText.trim()

  } catch (error: unknown) {
    console.error('Error improving PDF with Gemini:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid API key. Please check your API key.')
      } else if (error.message?.includes('QUOTA_EXCEEDED')) {
        throw new Error('API quota exceeded. Please check your Google Cloud billing.')
      } else if (error.message?.includes('SAFETY')) {
        throw new Error('Content was blocked for safety reasons. Please try with different text.')
      } else if (error.message?.includes('PERMISSION_DENIED')) {
        throw new Error('Permission denied. Please check your API key permissions.')
      } else {
        throw new Error(`Failed to improve PDF: ${error.message}`)
      }
    } else {
      throw new Error('Failed to improve PDF: Unknown error occurred')
    }
  }
}

// Legacy function for text-based improvement (kept for backward compatibility)
export const improveTextWithGemini = async (
  text: string, 
  apiKey: string,
  language: Language = 'english'
): Promise<string> => {
  try {
    if (!apiKey.trim()) {
      throw new Error('API key is required')
    }

    if (!text.trim()) {
      throw new Error('Text to improve is required')
    }

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Load the job prompt
    const jobPrompt = await loadJobPrompt(language)
    
    // Combine the job prompt with the user's text
    const fullPrompt = `${jobPrompt}\n\n---\n\n${text}`

    // Generate improved content
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const improvedText = response.text()

    if (!improvedText || improvedText.trim().length === 0) {
      throw new Error('No improved text was generated')
    }

    return improvedText.trim()

  } catch (error: unknown) {
    console.error('Error improving text with Gemini:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid API key. Please check your API key.')
      } else if (error.message?.includes('QUOTA_EXCEEDED')) {
        throw new Error('API quota exceeded. Please check your Google Cloud billing.')
      } else if (error.message?.includes('SAFETY')) {
        throw new Error('Content was blocked for safety reasons. Please try with different text.')
      } else if (error.message?.includes('PERMISSION_DENIED')) {
        throw new Error('Permission denied. Please check your API key permissions.')
      } else {
        throw new Error(`Failed to improve text: ${error.message}`)
      }
    } else {
      throw new Error('Failed to improve text: Unknown error occurred')
    }
  }
}
