import { NextRequest, NextResponse } from 'next/server';
import { generateInitialStructure } from '@/utils/generator';
import { NovelGenerationError } from '@/utils/error-handling';

export async function POST(request: NextRequest) {
    try {
      const { basicSettings, selectedLLM } = await request.json();
  
      if (!basicSettings) {
        return NextResponse.json(
          { error: 'basicSettings is required' },
          { status: 400 }
        );
      }
  
      const content = await generateInitialStructure(basicSettings, selectedLLM || 'deepseek');

      return NextResponse.json(content);
  
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