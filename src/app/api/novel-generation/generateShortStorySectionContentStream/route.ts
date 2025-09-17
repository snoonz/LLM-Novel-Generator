import { NextRequest } from 'next/server';
import { generateNovelSectionContentStream } from '@/utils/generator';
import { NovelGenerationError } from '@/utils/error-handling';

export async function POST(request: NextRequest) {
    try {
        const { basicSettings, section, previousSection, structure, selectedLLM } = await request.json();
    
        if (!basicSettings || !section || !structure) {
            return new Response('basicSettings, section, and structure are required', { status: 400 });
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of generateNovelSectionContentStream(
                        basicSettings, 
                        section, 
                        previousSection || null, 
                        structure, 
                        selectedLLM || 'deepseek'
                    )) {
                        controller.enqueue(encoder.encode(chunk));
                    }
                    controller.close();
                } catch (error) {
                    console.error('Streaming error:', error);
                    
                    let errorMessage = 'An error occurred while generating content';
                    if (error instanceof NovelGenerationError) {
                        errorMessage = error.getUserMessage();
                    }
                    
                    controller.enqueue(encoder.encode(`\n\n[エラー: ${errorMessage}]`));
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Request processing error:', error);
        return new Response('Invalid request format', { status: 400 });
    }
}