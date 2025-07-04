import { GoogleGenerativeAI } from '@google/generative-ai'

export type Language = 'english' | 'german' | 'french' | 'spanish' | 'italian' | 'portuguese' | 'dutch' | 'polish' | 'czech' | 'slovak' | 'hungarian' | 'romanian' | 'bulgarian' | 'croatian' | 'serbian' | 'slovenian' | 'estonian' | 'latvian' | 'lithuanian'

export interface GeminiResult {
  originalText: string
  improvedText: string
}

const languageNames: Record<Language, string> = {
  english: 'English',
  german: 'German',
  french: 'French',
  spanish: 'Spanish',
  italian: 'Italian',
  portuguese: 'Portuguese',
  dutch: 'Dutch',
  polish: 'Polish',
  czech: 'Czech',
  slovak: 'Slovak',
  hungarian: 'Hungarian',
  romanian: 'Romanian',
  bulgarian: 'Bulgarian',
  croatian: 'Croatian',
  serbian: 'Serbian',
  slovenian: 'Slovenian',
  estonian: 'Estonian',
  latvian: 'Latvian',
  lithuanian: 'Lithuanian'
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
  language: Language = 'english'
): Promise<GeminiResult> => {
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const targetLanguage = languageNames[language]

    const prompt = `Please analyze this PDF document and provide two things:

1. ORIGINAL_TEXT: Extract and transcribe all the text content from this document exactly as it appears, maintaining the original structure and wording.

2. IMPROVED_TEXT: Create an improved, cleaned, and well-structured version of the content in ${targetLanguage}. This should include:
   - Correct spelling and grammar errors
   - Organize content with clear headings and structure
   - Improve readability while preserving the original meaning
   - Format as clean, well-organized markdown
   - Maintain all important information from the original

Please format your response EXACTLY like this:

===ORIGINAL_TEXT===
[Put the exact transcribed text here]

===IMPROVED_TEXT===
[Put the improved and structured text here]

Make sure to include both sections clearly separated by the markers.`

    // Convert PDF to base64 for Gemini
    const imagePart = await fileToGenerativePart(pdfFile)
    
    // Generate content with PDF and prompt
    const result = await model.generateContent([prompt, imagePart])
    const response = result.response
    const text = response.text()

    // Parse the response to extract original and improved text
    const originalMatch = text.match(/===ORIGINAL_TEXT===\s*([\s\S]*?)\s*===IMPROVED_TEXT===/)?.[1]?.trim()
    const improvedMatch = text.match(/===IMPROVED_TEXT===\s*([\s\S]*?)(?:$|\n\n===)/)?.[1]?.trim()

    if (!originalMatch || !improvedMatch) {
      // Fallback parsing if the format is not exact
      const sections = text.split(/===(?:ORIGINAL_TEXT|IMPROVED_TEXT)===/)
      if (sections.length >= 3) {
        return {
          originalText: sections[1]?.trim() || 'Could not extract original text',
          improvedText: sections[2]?.trim() || text
        }
      }
      // If parsing fails, return the full response as improved text
      return {
        originalText: 'Could not extract original text',
        improvedText: text
      }
    }

    return {
      originalText: originalMatch,
      improvedText: improvedMatch
    }
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
