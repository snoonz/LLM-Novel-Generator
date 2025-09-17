import OpenAI from "openai";
import { NovelGenerationError } from "@/utils/error-handling";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function callLLM(
  systemPrompt: string,
  systemPrompt2: string | null,
  prompt: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  try {
    // システムプロンプトを結合
    let combinedSystemPrompt = systemPrompt;
    if (systemPrompt2) {
      combinedSystemPrompt += "\n\n" + systemPrompt2;
    }

    // デバッグログ: プロンプトの内容を出力
    console.log("=== LLM Request Debug ===");
    console.log("System Prompt:", combinedSystemPrompt);
    console.log("User Prompt:", prompt);
    console.log("Max Tokens:", maxTokens);
    console.log("Temperature:", temperature);
    console.log("========================");

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: combinedSystemPrompt },
        { role: "user", content: prompt },
      ],
      model: "deepseek-chat",
      max_tokens: maxTokens,
      temperature: temperature,
    });

    return completion.choices[0].message.content ?? "";
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
    // システムプロンプトを結合
    let combinedSystemPrompt = systemPrompt;
    if (systemPrompt2) {
      combinedSystemPrompt += "\n\n" + systemPrompt2;
    }

    // デバッグログ: プロンプトの内容を出力
    console.log("=== LLM Stream Request Debug ===");
    console.log("System Prompt:", combinedSystemPrompt);
    console.log("User Prompt:", prompt);
    console.log("Max Tokens:", maxTokens);
    console.log("Temperature:", temperature);
    console.log("=================================");

    const stream = await openai.chat.completions.create({
      messages: [
        { role: "system", content: combinedSystemPrompt },
        { role: "user", content: prompt },
      ],
      model: "deepseek-chat",
      max_tokens: maxTokens,
      temperature: temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
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
