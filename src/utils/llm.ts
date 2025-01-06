import Anthropic from "@anthropic-ai/sdk";
import { NovelGenerationError } from "@/utils/error-handling";
import { TextBlockParam } from "@anthropic-ai/sdk/resources/index.mjs";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // サーバーサイドの環境変数
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
      model: "claude-3-5-sonnet-latest",
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
