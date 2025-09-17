import { NextRequest, NextResponse } from 'next/server';
import { generateNovelStructure } from '@/utils/generator';
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
  
      const content = await generateNovelStructure(basicSettings, selectedLLM || 'deepseek');

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