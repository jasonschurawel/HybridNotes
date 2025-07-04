import * as pdfjsLib from 'pdfjs-dist'
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api'

// Disable PDF.js worker completely - run everything in main thread
pdfjsLib.GlobalWorkerOptions.workerSrc = ''

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false
    }).promise
    
    let extractedText = ''
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // Combine text items with proper spacing
      const pageText = textContent.items
        .map((item: TextItem | TextMarkedContent) => {
          if ('str' in item) {
            return item.str
          }
          return ''
        })
        .join(' ')
      
      extractedText += pageText + '\n\n'
    }
    
    // Clean up the extracted text
    return extractedText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
      .trim()
    
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF. Please make sure the file is a valid PDF.')
  }
}
