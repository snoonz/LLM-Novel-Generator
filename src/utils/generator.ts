import { Novel, Chapter } from '@/types/novel';
import { callLLM } from './llm';
import { systemPrompt, createInitialPrompt, createContentPrompt1, createContentPrompt2 } from './prompts_novel';
import { NovelGenerationError } from './error-handling';

export async function generateInitialStructure(basicSettings: string): Promise<Novel> {
    try {
      const prompt = createInitialPrompt(basicSettings);
      const response = await callLLM(systemPrompt, null, prompt, 4000, 0.7);
      // Claudeの出力からJSONだけを抽出
      const jsonText = removeMarkdown(response);
        if (!jsonText) {
          throw new Error('Invalid response format');
        }
        const content = JSON.parse(jsonText);
        return content;
    } catch (error) {
      console.error('Failed to generate initial structure:', error);
      throw error;
    }
  }
  
  function removeMarkdown(text: string): string {
    return text
      .replace(/^```json\n/, "") // 先頭の```jsonを削除
      .replace(/\n```$/, "") // 末尾の```を削除
      .trim();
  }

  /**
   * Generates the content for a chapter in a novel.
   *
   * @param basicSettings - The basic settings for the novel generation.
   * @param chapter - The chapter object containing the title, number of pages, and summary.
   * @returns The updated chapter object with the generated content.
   * @throws {NovelGenerationError} If there is an error generating the content for the chapter.
   */
  export async function generateChapterContent(basicSettings: string, chapter: Chapter, previousChapter: Chapter | null, structure: Novel): Promise<Chapter> {
    try {
      const contentWhiteSpaceRemoved = chapter.content?.replace(/\n\n/g, '\n') ?? null;
      const lastLines = contentWhiteSpaceRemoved?.split('\n').slice(-5).join('\n') ?? null;

      // 本文生成用のプロンプトを作成
      const prompt = createContentPrompt1(
        basicSettings,
        JSON.stringify(structure)
      );

      const systemPrompt2 = createContentPrompt2(
        chapter.title,
        chapter.n_pages,
        chapter.summary,
        lastLines
      );

      // LLMに本文生成をリクエスト
      const content = await callLLM(systemPrompt, systemPrompt2, prompt, 4000, 0.7);

      // 生成された本文を設定して返す
      return { 
        ...chapter, 
        content: content.trim() // 余分な空白を削除
      };
    } catch (error) {
      console.error(`Failed to generate content for chapter "${chapter.title}":`, error);
      throw new NovelGenerationError(
        `章「${chapter.title}」の本文生成に失敗しました`,
        '本文生成',
        error instanceof Error ? error : undefined
      );
    }
  }