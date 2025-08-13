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

// Upload file to Google Files API for large files (50MB+)
const uploadLargeFile = async (file: File, apiKey: string) => {
  console.log(`Uploading large file (${(file.size / 1024 / 1024).toFixed(1)}MB) to Files API...`);
  
  // Create form data for multipart upload
  const formData = new FormData();
  
  // Add metadata
  const metadata = {
    file: {
      displayName: file.name,
      mimeType: file.type
    }
  };
  
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('data', file);

  try {
    const uploadResponse = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Files API upload error:', errorText);
      throw new Error(`Files API upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('File uploaded successfully:', uploadResult.file.name);
    
    // Wait for the file to be processed
    let fileState = 'PROCESSING';
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max wait time
    
    while (fileState === 'PROCESSING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${uploadResult.file.name}?key=${apiKey}`
      );
      
      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        fileState = statusResult.state;
        console.log(`File processing state: ${fileState}`);
      }
      
      attempts++;
    }
    
    if (fileState !== 'ACTIVE') {
      throw new Error(`File processing failed. Final state: ${fileState}`);
    }
    
    return {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: file.type,
      },
    };
  } catch (error) {
    console.error('Large file upload failed:', error);
    throw new Error(`Large file upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Convert file to base64 for Gemini API or use Files API for large files
const fileToGenerativePart = async (file: File, apiKey: string) => {
  // Use Files API for files larger than 50MB, base64 for smaller files
  const largeFileThreshold = 50 * 1024 * 1024; // 50MB threshold
  const maxFileSize = 2 * 1024 * 1024 * 1024; // 2GB maximum for Files API
  
  if (file.size > maxFileSize) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 2GB limit. Please use a smaller PDF file or split it into smaller documents.`);
  }

  // Use Files API for large files
  if (file.size > largeFileThreshold) {
    return await uploadLargeFile(file, apiKey);
  }

  // Use base64 for smaller files (existing implementation)
  console.log(`Processing file (${(file.size / 1024 / 1024).toFixed(1)}MB) via base64 upload...`);
  
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    
    // Extended timeout for large files
    const timeout = setTimeout(() => {
      reader.abort()
      reject(new Error('File reading timeout. The file may be too large or corrupted.'))
    }, 120000) // 2 minutes timeout for large files
    
    reader.onloadend = () => {
      clearTimeout(timeout)
      if (reader.result) {
        const base64String = (reader.result as string).split(',')[1]
        resolve(base64String)
      } else {
        reject(new Error('Failed to read file content'))
      }
    }
    
    reader.onerror = () => {
      clearTimeout(timeout)
      reject(new Error('Failed to read file'))
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

    // Log file size for debugging
    console.log(`Processing PDF: ${pdfFile.name}, Size: ${(pdfFile.size / 1024 / 1024).toFixed(2)}MB`)

    // Initialize the Gemini API with increased timeout
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        // Add timeout and safety settings for large files
        maxOutputTokens: 8192,
      }
    })

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

    console.log('Converting PDF to base64...')
    // Convert PDF to base64 for Gemini
    let imagePart: any;
    try {
      imagePart = await fileToGenerativePart(pdfFile, apiKey)
    } catch (uploadError) {
      throw new Error(`File processing failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
    }
    
    console.log('Sending request to Gemini API...')
    // Add retry logic for network issues
    let lastError: Error | null = null
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create a timeout promise for the API call - extended for very large files
        const apiCallPromise = model.generateContent([prompt, imagePart])
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('API request timeout after 300 seconds')), 300000) // 5 minutes for very large files
        )
        
        const result = await Promise.race([apiCallPromise, timeoutPromise])
        const response = result.response
        const text = response.text()

        console.log('Received response from Gemini API')

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
      } catch (error) {
        lastError = error as Error
        console.warn(`Attempt ${attempt} failed:`, error)
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000
          console.log(`Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    // If all retries failed, throw the last error
    throw lastError || new Error('All retry attempts failed')
    
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
      } else if (error.message?.includes('timeout')) {
        throw new Error('Request timeout. Large files may take longer to process. Please try again or use a smaller file.')
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.')
      } else if (error.message?.includes('exceeds the') && error.message?.includes('limit')) {
        throw error // Re-throw file size errors as-is
      } else {
        throw new Error(`Failed to improve PDF: ${error.message}`)
      }
    } else {
      throw new Error('Failed to improve PDF: Unknown error occurred')
    }
  }
}

