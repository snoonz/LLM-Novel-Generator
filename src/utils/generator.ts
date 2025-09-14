import { Novel, Chapter } from '@/types/novel';
import { systemPrompt, createInitialPrompt, createContentPrompt1, createContentPrompt2 } from './prompts_novel';
import { NovelGenerationError } from './error-handling';

async function getLLMFunction(provider: 'claude' | 'deepseek' | 'xai') {
  switch (provider) {
    case 'claude':
      const claudeModule = await import('./llm');
      return claudeModule.callLLM;
    case 'deepseek':
      const deepseekModule = await import('./llm_deepseek');
      return deepseekModule.callLLM;
    case 'xai':
      const xaiModule = await import('./llm_xai');
      return xaiModule.callLLM;
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

export async function generateInitialStructure(basicSettings: string, selectedLLM: 'claude' | 'deepseek' | 'xai' = 'deepseek'): Promise<Novel> {
    try {
      const callLLM = await getLLMFunction(selectedLLM);
      const prompt = createInitialPrompt(basicSettings);
      const response = await callLLM(systemPrompt, null, prompt, 8192, 0.7);
      
      // LLMの出力からJSONだけを抽出
      const jsonText = removeMarkdown(response);
      if (!jsonText) {
        console.error('Empty JSON text after processing response:', response);
        throw new Error(`Invalid response format - no JSON found in response`);
      }
      
      try {
        const content = JSON.parse(jsonText);
        return content;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Attempted to parse:', jsonText);
        console.error('Original response:', response);
        throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to generate initial structure:', error);
      throw error;
    }
  }
  
  function removeMarkdown(text: string): string {
    // コードブロック記法を削除
    let cleanText = text.trim();
    
    // 先頭のコードブロック記法を削除
    cleanText = cleanText.replace(/^```[a-zA-Z]*\n?/, '');
    
    // 末尾のコードブロック記法を削除
    cleanText = cleanText.replace(/\n?```$/, '');
    
    // バッククォートで囲まれたJSONを検出して抽出
    const jsonMatch = cleanText.match(/^[\s]*(\{[\s\S]*\})[\s]*$/);
    if (jsonMatch) {
      return jsonMatch[1];
    }
    
    return cleanText.trim();
  }

  /**
   * Generates the content for a chapter in a novel.
   *
   * @param basicSettings - The basic settings for the novel generation.
   * @param chapter - The chapter object containing the title, number of pages, and summary.
   * @returns The updated chapter object with the generated content.
   * @throws {NovelGenerationError} If there is an error generating the content for the chapter.
   */
  export async function generateChapterContent(basicSettings: string, chapter: Chapter, previousChapter: Chapter | null, structure: Novel, selectedLLM: 'claude' | 'deepseek' | 'xai' = 'deepseek'): Promise<Chapter> {
    try {
      const callLLM = await getLLMFunction(selectedLLM);
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