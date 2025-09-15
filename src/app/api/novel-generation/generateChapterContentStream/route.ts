import { NextRequest, NextResponse } from 'next/server';
import { generateChapterContentStream } from '@/utils/generator';
import { NovelGenerationError } from '@/utils/error-handling';
import { Chapter, Novel } from '@/types/novel';

export async function POST(request: NextRequest) {
    try {
      const { basicSettings, context, selectedLLM, contentType } = await request.json();
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
          { error: 'chapter is required' },
          { status: 400 }
        );
      }

      // Server-Sent Events用のヘッダーを設定
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let fullContent = '';
            
            for await (const chunk of generateChapterContentStream(
              basicSettings, 
              chapter, 
              previous, 
              structure, 
              selectedLLM || 'deepseek',
              contentType || 'novel'
            )) {
              fullContent += chunk;
              
              // SSE形式でデータを送信
              const data = JSON.stringify({ 
                type: 'chunk', 
                content: chunk,
                fullContent: fullContent 
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            // 完了を通知
            const completeData = JSON.stringify({ 
              type: 'complete', 
              content: fullContent 
            });
            controller.enqueue(encoder.encode(`data: ${completeData}\n\n`));
            controller.close();

          } catch (error) {
            console.error('Stream error:', error);
            
            const errorData = JSON.stringify({ 
              type: 'error', 
              error: error instanceof NovelGenerationError 
                ? error.getUserMessage() 
                : 'An error occurred while processing your request' 
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
  
    } catch (error) {
      console.error('API Error:', error);
      
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