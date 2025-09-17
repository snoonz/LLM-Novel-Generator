import { NextRequest, NextResponse } from 'next/server';
import { generateNovelSectionContent } from '@/utils/generator';
import { NovelGenerationError } from '@/utils/error-handling';

export async function POST(request: NextRequest) {
    try {
      const { basicSettings, section, previousSection, structure, selectedLLM } = await request.json();
  
      if (!basicSettings || !section || !structure) {
        return NextResponse.json(
          { error: 'basicSettings, section, and structure are required' },
          { status: 400 }
        );
      }
  
      const updatedSection = await generateNovelSectionContent(
        basicSettings, 
        section, 
        previousSection || null, 
        structure, 
        selectedLLM || 'deepseek'
      );

      return NextResponse.json(updatedSection);
  
    } catch (error) {
      console.error('LLM API Error:', error);
      
      if (error instanceof NovelGenerationError) {
        return NextResponse.json(
          { error: error.getUserMessage() },
          { status: 500 }
        );
      }
  
      return NextResponse.json(
        { error: 'An error occurred while processing your request' },
        { status: 500 }
      );
    }
  }