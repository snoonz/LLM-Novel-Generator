"use client";

import { useState } from "react";
import { Novel, NovelSection, Chapter, ChapterContext, Textbook } from "@/types/novel";
import NovelDisplay from "./NovelDisplay";
import NovelEditor from "./NovelEditor";
import GenerationProgress from "./GenerationProgress";

export default function NovelGenerator() {
  const [basicSettings, setBasicSettings] = useState("");
  const [structure, setStructure] = useState<Novel | Textbook | null>(null);
  const [generatedNovel, setGeneratedNovel] = useState<Novel | Textbook | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [selectedLLM, setSelectedLLM] = useState<"claude" | "deepseek" | "xai">("deepseek");
  const [contentType, setContentType] = useState<"novel" | "textbook">("novel");
  const [characterCount, setCharacterCount] = useState(5000);

  // データ構造判別関数
  const isNovel = (data: Novel | Textbook): data is Novel => {
    return 'sections' in data;
  };


  // 特定のチャプターを再生成する関数
  const regenerateChapter = async (chapter: Chapter) => {
    if (!structure || !basicSettings) return;
    
    setIsGenerating(true);
    setCurrentStep(`${chapter.title}を再生成中...`);

    try {
      const previousChapter = findPreviousChapter(generatedNovel as Novel, chapter);

      const context: ChapterContext = {
        chapter: chapter,
        previousChapter: previousChapter
          ? {
              title: previousChapter.title,
              summary: previousChapter.summary,
              content: previousChapter.content || "",
            }
          : null,
        structure: structure as Textbook,
      };

      // ストリーミング再生成
      await new Promise<void>((resolve, reject) => {
        fetch("/api/novel-generation/generateChapterContentStream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ basicSettings, context, selectedLLM, contentType, characterCount }),
        }).then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullContent = '';

          const readStream = async () => {
            while (true) {
              const { done, value } = await reader!.read();
              
              if (done) break;
              
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    
                    if (data.type === 'chunk') {
                      fullContent = data.fullContent;
                      
                      // リアルタイムで章の内容を更新
                      const updatedChapter = {
                        ...chapter,
                        content: fullContent,
                      };

                      setGeneratedNovel((current) =>
                        current
                          ? {
                              ...current,
                              children: updateChapterInTree((current as Textbook).children, updatedChapter),
                            }
                          : null
                      );
                      
                    } else if (data.type === 'complete') {
                      // 完了時の最終処理
                      const finalChapter = {
                        ...chapter,
                        content: data.content,
                      };
                      
                      setGeneratedNovel((current) =>
                        current
                          ? {
                              ...current,
                              children: updateChapterInTree((current as Textbook).children, finalChapter),
                            }
                          : null
                      );
                      
                      resolve();
                      return;
                      
                    } else if (data.type === 'error') {
                      reject(new Error(data.error));
                      return;
                    }
                  } catch (parseError) {
                    console.warn('Failed to parse SSE data:', parseError);
                  }
                }
              }
            }
          };

          readStream().catch(reject);
        }).catch(reject);
      });
      
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "チャプターの再生成中にエラーが発生しました"
      );
    } finally {
      setIsGenerating(false);
      setCurrentStep("");
    }
  };

  // 前のチャプターを探す関数
  const findPreviousChapter = (
    novel: Novel,
    targetChapter: Chapter
  ): Chapter | null => {
    const flatChapters = flattenChapters(novel);
    const index = flatChapters.findIndex(
      (ch) => ch.title === targetChapter.title
    );
    return index > 0 ? flatChapters[index - 1] : null;
  };

  // チャプターを平坦化する関数
  const flattenChapters = (novel: Novel | Chapter): Chapter[] => {
    if ("children" in novel && novel.children) {
      return novel.children.flatMap((chapter) => {
        if (chapter.children?.length) {
          return flattenChapters(chapter);
        }
        return [chapter];
      });
    }
    return [];
  };

  const generateNovel = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setCurrentStep("構造生成中");

    try {
      const initialStructure = await fetch(
        "/api/novel-generation/generateInitialStructure",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ basicSettings, selectedLLM, contentType, characterCount }),
        }
      ).then((res) => res.json());

      setGeneratedNovel(initialStructure);
      setStructure(initialStructure);
      setProgress(20);
      setCurrentStep("構造生成完了");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "小説の生成中にエラーが発生しました"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContent = async () => {
    if (!basicSettings || !generatedNovel || !structure) return;
    setIsGenerating(true);

    // 小説の場合
    if (isNovel(generatedNovel)) {
      return await generateNovelContent();
    }

    // 教科書の場合
    const totalChapters = countLeafChapters(generatedNovel);

    // 平坦化されたチャプターリストを生成する関数
    const flattenChapters = (chapter: Chapter): Chapter[] => {
      if (!chapter.children?.length) {
        return [chapter];
      }
      return chapter.children.flatMap(flattenChapters);
    };

    // すべての末端チャプターを順番に取得
    const allLeafChapters = generatedNovel.children.flatMap(flattenChapters);

    // チャプターごとに生成を実行
    for (let i = 0; i < allLeafChapters.length; i++) {
      const currentChapter = allLeafChapters[i];
      const previousChapter = i > 0 ? allLeafChapters[i - 1] : null;

      try {
        const context: ChapterContext = {
          chapter: currentChapter,
          previousChapter: previousChapter
            ? {
                title: previousChapter.title,
                summary: previousChapter.summary,
                content: previousChapter.content || "",
              }
            : null,
          structure: structure as Textbook,
        };

        setCurrentStep(`${currentChapter.title}を生成中...`);

        // ストリーミング生成を開始
        await generateChapterWithStream(currentChapter, context, i, allLeafChapters, totalChapters);

      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "小説の生成中にエラーが発生しました"
        );
      }
    }

    setProgress(100);
    setCurrentStep("完了");
    setIsGenerating(false);
  };

  // 小説用のコンテンツ生成
  const generateNovelContent = async () => {
    if (!basicSettings || !generatedNovel || !isNovel(generatedNovel)) return;
    
    let currentStory = generatedNovel; // 現在の状態を追跡
    const totalSections = currentStory.sections.length;

    for (let i = 0; i < currentStory.sections.length; i++) {
      const currentSection = currentStory.sections[i];
      const previousSection = i > 0 ? currentStory.sections[i - 1] : null;

      try {
        setCurrentStep(`${currentSection.title}を生成中...`);

        await generateNovelSectionWithStream(currentSection, previousSection, currentStory, i, totalSections);
        
        // 生成完了後、最新の状態を取得
        // setGeneratedNovelの更新を待つために、一定時間待機
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 最新の状態を取得（stateが更新されている前提）
        setGeneratedNovel(current => {
          if (current && isNovel(current)) {
            currentStory = current;
          }
          return current;
        });

      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "小説の生成中にエラーが発生しました"
        );
      }
    }

    setProgress(100);
    setCurrentStep("完了");
    setIsGenerating(false);
  };

  const generateNovelSectionWithStream = async (
    currentSection: NovelSection,
    previousSection: NovelSection | null,
    story: Novel,
    sectionIndex: number,
    totalSections: number
  ) => {
    return new Promise<void>((resolve, reject) => {
      fetch("/api/novel-generation/generateShortStorySectionContentStream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          basicSettings, 
          section: currentSection, 
          previousSection, 
          structure: story, 
          selectedLLM,
          characterCount
        }),
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        const readStream = async () => {
          while (true) {
            const { done, value } = await reader!.read();
            
            if (done) break;
            
            const chunk = decoder.decode(value);
            fullContent += chunk;
            
            // セクション内容をリアルタイムで更新
            const updatedSection = {
              ...currentSection,
              content: fullContent,
            };

            setGeneratedNovel((current) => {
              if (!current || !isNovel(current)) return current;
              
              const updatedStory: Novel = {
                ...current,
                sections: current.sections.map((section, idx) =>
                  idx === sectionIndex ? updatedSection : section
                )
              };
              
              return updatedStory;
            });

            // 進行状況を更新
            const baseProgress = 20 + (sectionIndex / totalSections) * 70;
            const chunkProgress = Math.min(10, (fullContent.length / (currentSection.targetLength * 1.2)) * (70 / totalSections));
            setProgress(Math.min(95, baseProgress + chunkProgress));
          }
          
          // 完了処理
          const finalSection = {
            ...currentSection,
            content: fullContent,
          };

          setGeneratedNovel((current) => {
            if (!current || !isNovel(current)) return current;
            
            const updatedStory: Novel = {
              ...current,
              sections: current.sections.map((section, idx) =>
                idx === sectionIndex ? finalSection : section
              )
            };
            
            return updatedStory;
          });

          const currentProgress = Math.floor(20 + ((sectionIndex + 1) / totalSections) * 80);
          setProgress(currentProgress);
          setCurrentStep(`${sectionIndex + 1}/${totalSections}セクション完了`);
          
          resolve();
        };

        readStream().catch(reject);
      }).catch(reject);
    });
  };

  const generateChapterWithStream = async (
    currentChapter: Chapter,
    context: ChapterContext,
    chapterIndex: number,
    allLeafChapters: Chapter[],
    totalChapters: number
  ) => {
    return new Promise<void>((resolve, reject) => {
      // fetchを使用してSSEを受信
      fetch("/api/novel-generation/generateChapterContentStream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ basicSettings, context, selectedLLM, contentType, characterCount }),
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        const readStream = async () => {
          while (true) {
            const { done, value } = await reader!.read();
            
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'chunk') {
                    fullContent = data.fullContent;
                    
                    // リアルタイムで章の内容を更新
                    const updatedChapter = {
                      ...currentChapter,
                      content: fullContent,
                    };

                    setGeneratedNovel((current) =>
                      current
                        ? {
                            ...current,
                            children: updateChapterInTree((current as Textbook).children, updatedChapter),
                          }
                        : null
                    );

                    // 進行状況を更新
                    const baseProgress = 20 + (chapterIndex / totalChapters) * 70;
                    const chunkProgress = (fullContent.length / (currentChapter.n_pages * 400)) * (70 / totalChapters);
                    setProgress(Math.min(95, baseProgress + chunkProgress));
                    
                  } else if (data.type === 'complete') {
                    // 完了時の最終処理
                    const finalChapter = {
                      ...currentChapter,
                      content: data.content,
                    };
                    
                    allLeafChapters[chapterIndex] = finalChapter;
                    
                    setGeneratedNovel((current) =>
                      current
                        ? {
                            ...current,
                            children: updateChapterInTree((current as Textbook).children, finalChapter),
                          }
                        : null
                    );

                    const currentProgress = Math.floor(20 + ((chapterIndex + 1) / totalChapters) * 80);
                    setProgress(currentProgress);
                    setCurrentStep(`${chapterIndex + 1}/${totalChapters}チャプター完了`);
                    
                    resolve();
                    return;
                    
                  } else if (data.type === 'error') {
                    reject(new Error(data.error));
                    return;
                  }
                } catch (parseError) {
                  console.warn('Failed to parse SSE data:', parseError);
                }
              }
            }
          }
        };

        readStream().catch(reject);
      }).catch(reject);
    });
  };


  const countLeafChapters = (data: Novel | Textbook | Chapter): number => {
    if ("sections" in data) {
      // Novelの場合
      return data.sections.length;
    }
    if ("children" in data && data.children) {
      // TextbookまたはChapterの場合
      return data.children.reduce(
        (sum, chapter) => sum + countLeafChapters(chapter),
        0
      );
    }
    return 1;
  };

  const updateChapterInTree = (
    chapters: Chapter[],
    updatedChapter: Chapter
  ): Chapter[] => {
    return chapters.map((chapter) => {
      if (chapter.title === updatedChapter.title) {
        return updatedChapter;
      }
      if (chapter.children) {
        return {
          ...chapter,
          children: updateChapterInTree(chapter.children, updatedChapter),
        };
      }
      return chapter;
    });
  };

  const [isEditing, setIsEditing] = useState(false);

  // Novel/Textbook更新用の関数を追加
  const handleNovelUpdate = (updatedData: Novel | Textbook) => {
    setGeneratedNovel(updatedData);
    setStructure(updatedData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <div>
          <label className="block text-lg font-medium mb-2">コンテンツタイプ</label>
          <select
            className="w-full p-2 border rounded-lg mb-4"
            value={contentType}
            onChange={(e) => setContentType(e.target.value as "novel" | "textbook")}
            disabled={isGenerating}
          >
            <option value="novel">小説</option>
            <option value="textbook">教科書</option>
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">LLM選択</label>
          <select
            className="w-full p-2 border rounded-lg mb-4"
            value={selectedLLM}
            onChange={(e) => setSelectedLLM(e.target.value as "claude" | "deepseek" | "xai")}
            disabled={isGenerating}
          >
            <option value="deepseek">DeepSeek</option>
            <option value="xai">xAI (Grok)</option>
            <option value="claude">Claude</option>
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">文字数設定</label>
          <input
            type="number"
            className="w-full p-2 border rounded-lg mb-4"
            value={characterCount}
            onChange={(e) => setCharacterCount(parseInt(e.target.value) || 5000)}
            placeholder="生成する文字数を入力してください"
            min="1000"
            max="20000"
            disabled={isGenerating}
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">基本設定</label>
          <textarea
            className="w-full h-40 p-4 border rounded-lg"
            value={basicSettings}
            onChange={(e) => setBasicSettings(e.target.value)}
            placeholder={contentType === "novel" ? "小説の基本設定を入力してください..." : "教科書の基本設定を入力してください..."}
            disabled={isGenerating}
          />
        </div>
        <div className="flex items-center space-x-4">
          <button
            className={`px-6 py-2 rounded-lg ${
              isGenerating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
            onClick={generateNovel}
            disabled={isGenerating}
          >
{isGenerating ? "生成中..." : (contentType === "novel" ? "基本生成" : "教科書構造生成")}
          </button>
          <button
            className={`px-6 py-2 rounded-lg ${
              isGenerating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
            onClick={generateContent}
            disabled={isGenerating || !generatedNovel}
          >
{isGenerating ? "生成中..." : (contentType === "novel" ? "本文生成" : "教科書本文生成")}
          </button>
        </div>

        {isGenerating && (
          <GenerationProgress currentStep={currentStep} progress={progress} />
        )}

        {error && (
          <div className="text-red-600 p-4 bg-red-100 rounded-lg">{error}</div>
        )}

        {generatedNovel && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                {isEditing ? "表示モードへ" : "編集モードへ"}
              </button>
            </div>
            {isEditing ? (
              <NovelEditor
                novel={generatedNovel}
                onUpdate={handleNovelUpdate}
              />
            ) : (
              <NovelDisplay
                novel={generatedNovel}
                onRegenerateChapter={regenerateChapter}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
