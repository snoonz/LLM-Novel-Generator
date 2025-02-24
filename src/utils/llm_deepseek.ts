// import OpenAI from "openai";
// import { NovelGenerationError } from "@/utils/error-handling";
// import { TextBlockParam } from "@anthropic-ai/sdk/resources/index.mjs";

// const openai = new OpenAI({
//   baseURL: "https://api.deepseek.com",
//   apiKey: process.env.DEEPSEEK_API_KEY,
// });

// export async function callLLM(
//   systemPrompt: string,
//   systemPrompt2: string | null,
//   prompt: string,
//   maxTokens: number,
//   temperature: number
// ): Promise<string> {
//   try {
//     const systemPrompts: TextBlockParam[] = [
//       {
//         type: "text",
//         text: systemPrompt,
//       },
//     ];
//     if (systemPrompt2) {
//       systemPrompts.push({
//         type: "text",
//         text: systemPrompt2,
//       });
//     }

//     const completion = await openai.chat.completions.create({
//       messages: [
//         { role: "system", content: systemPrompts },
//         { role: "user", content: prompt },
//       ],
//       model: "deepseek-chat",
//     });

//     return completion.choices[0].message.content ?? "";
//   } catch (error) {
//     console.error("LLM API Error:", error);

//     if (error instanceof NovelGenerationError) {
//       throw error;
//     }

//     throw new NovelGenerationError(
//       "不明なエラーが発生しました",
//       "API呼び出し",
//       error instanceof Error ? error : undefined
//     );
//   }
// }
