import { NextRequest, NextResponse } from 'next/server';

// Define the type for pdf-parse
interface PDFData {
  numpages: number;
  text: string;
  info?: {
    Title?: string;
    Author?: string;
    Creator?: string;
  };
}

type PDFParseFunction = (buffer: Buffer, options?: { max?: number }) => Promise<PDFData>;

// Dynamic import to avoid potential issues
let pdfParse: PDFParseFunction | null = null;

// API route to handle PDF resume upload and text extraction
export async function POST(request: NextRequest) {
  console.log('Upload API called');
  
  try {
    // Dynamic import of pdf-parse
    if (!pdfParse) {
      const pdfParseModule = await import('pdf-parse');
      pdfParse = pdfParseModule.default as PDFParseFunction;
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('File received:', file?.name, file?.size, file?.type);

    if (!file) {
      console.log('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.log('File too large:', file.size);
      return NextResponse.json(
        { error: 'File size too large. Please upload a file smaller than 10MB.' },
        { status: 400 }
      );
    }

    console.log('Starting PDF parsing...');

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Buffer created, size:', buffer.length);

    // Parse PDF and extract text with minimal options first
    let data;
    try {
      data = await pdfParse(buffer);
    } catch (parseError) {
      console.log('Primary parsing failed, trying with minimal options:', parseError);
      // Try with minimal options
      data = await pdfParse(buffer, {
        max: 10, // Limit to first 10 pages
      });
    }

    console.log('PDF parsed successfully, pages:', data.numpages, 'text length:', data.text?.length);

    const text = data.text;

    if (!text || text.trim().length === 0) {
      console.log('No text content found in PDF');
      return NextResponse.json(
        { error: 'No text content found in PDF. This PDF might be image-based or protected. Please ensure the PDF contains selectable text.' },
        { status: 400 }
      );
    }

    // Clean and format text
    const cleanedText = cleanText(text);

    console.log('Text cleaned, final length:', cleanedText.length);

    // Get file info
    const fileInfo = {
      name: file.name,
      size: formatFileSize(file.size),
      pages: data.numpages,
      title: data.info?.Title || 'Unknown',
      author: data.info?.Author || 'Unknown',
      creator: data.info?.Creator || 'Unknown',
    };

    console.log('Returning success response');

    return NextResponse.json({
      success: true,
      text: cleanedText,
      fileInfo
    });

  } catch (error) {
    console.error('PDF parsing error:', error);
    
    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to parse PDF file',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? (error as Error)?.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Clean and format extracted text
function cleanText(text: string): string {
  return text
    // Remove excessive whitespace but preserve line breaks for structure
    .replace(/[ \t]+/g, ' ')
    // Remove excessive line breaks (more than 2)
    .replace(/\n{3,}/g, '\n\n')
    // Fix common PDF extraction issues with spacing
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Fix year ranges that get split
    .replace(/(\d{4})\s*-\s*(\d{4})/g, '$1-$2')
    .replace(/(\d{4})\s*-\s*now/gi, '$1-present')
    // Fix email addresses
    .replace(/(\w+)\s*@\s*(\w+)\s*\.\s*(\w+)/g, '$1@$2.$3')
    // Fix phone numbers
    .replace(/\((\d{3})\)\s*(\d{3})\s*-?\s*(\d{4})/g, '($1) $2-$3')
    // Fix URLs
    .replace(/https?\s*:\s*\/\s*\/\s*/g, 'https://')
    // Clean up section headers (preserve important formatting)
    .replace(/^([A-Z][A-Za-z\s&]+)$/gm, '$1')
    // Remove leading and trailing whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    // Final cleanup
    .trim();
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
} 
