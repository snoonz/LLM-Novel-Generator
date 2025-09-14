import { NextRequest, NextResponse } from 'next/server';
import { generateChapterContent } from '@/utils/generator';
import { NovelGenerationError } from '@/utils/error-handling';
import { Chapter, Novel } from '@/types/novel';

export async function POST(request: NextRequest) {
    try {
      const { basicSettings, context, selectedLLM } = await request.json();
      const chapter = context.chapter as Chapter;
      const previous = context.previousChapter as Chapter | null;
      const structure = context.structure as Novel;

      if (!basicSettings) {
        return NextResponse.json(
          { error: 'basicSettings is required' },
          { status: 400 }
        );
      }

      if (!chapter) {
        return NextResponse.json(
          { error: 'initialStructure is required' },
          { status: 400 }
        );
      }
  
      const content = await generateChapterContent(basicSettings, chapter, previous, structure, selectedLLM || 'deepseek');

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