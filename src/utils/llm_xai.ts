import Anthropic from "@anthropic-ai/sdk";
import { NovelGenerationError } from "@/utils/error-handling";
import { TextBlockParam } from "@anthropic-ai/sdk/resources/index.mjs";

const anthropic = new Anthropic({
  apiKey: process.env.XAI_API_KEY, // サーバーサイドの環境変数
  baseURL: "https://api.x.ai/"
});

export async function callLLM(
  systemPrompt: string,
  systemPrompt2: string | null,
  prompt: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  try {
    const systemPrompts: TextBlockParam[] = [
      {
        type: "text",
        text: systemPrompt,
      },
    ];
    if (systemPrompt2) {
      systemPrompts.push({
        type: "text",
        text: systemPrompt2,
      });
    }

    const response = await anthropic.messages.create({
      model: "grok-4",
      max_tokens: maxTokens,
      temperature: temperature,
      system: systemPrompts,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.content[0].type === "text" ? response.content[0].text : "";
  } catch (error) {
    console.error("LLM API Error:", error);

    if (error instanceof NovelGenerationError) {
      throw error;
    }

    throw new NovelGenerationError(
      "不明なエラーが発生しました",
      "API呼び出し",
      error instanceof Error ? error : undefined
    );
  }
}

export async function* callLLMStream(
  systemPrompt: string,
  systemPrompt2: string | null,
  prompt: string,
  maxTokens: number,
  temperature: number
): AsyncGenerator<string, void, unknown> {
  try {
    const systemPrompts: TextBlockParam[] = [
      {
        type: "text",
        text: systemPrompt,
      },
    ];
    if (systemPrompt2) {
      systemPrompts.push({
        type: "text",
        text: systemPrompt2,
      });
    }

    const stream = anthropic.messages.stream({
      model: "grok-4",
      max_tokens: maxTokens,
      temperature: temperature,
      system: systemPrompts,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    for await (const messageStreamEvent of stream) {
      if (messageStreamEvent.type === 'content_block_delta' && 
          messageStreamEvent.delta.type === 'text_delta') {
        yield messageStreamEvent.delta.text;
      }
    }
  } catch (error) {
    console.error("LLM API Error:", error);

    if (error instanceof NovelGenerationError) {
      throw error;
    }

    throw new NovelGenerationError(
      "不明なエラーが発生しました",
      "API呼び出し",
      error instanceof Error ? error : undefined
    );
  }
}
