"use client";

import { useState } from "react";
import { Novel, Chapter, ChapterContext } from "@/types/novel";
import NovelDisplay from "./NovelDisplay";
import NovelEditor from "./NovelEditor";
import GenerationProgress from "./GenerationProgress";

export default function NovelGenerator() {
  const [basicSettings, setBasicSettings] = useState("");
  const [structure, setStructure] = useState<Novel | null>(null);
  const [generatedNovel, setGeneratedNovel] = useState<Novel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [selectedLLM, setSelectedLLM] = useState<"claude" | "deepseek" | "xai">("deepseek");

  // 特定のチャプターを再生成する関数
  const regenerateChapter = async (chapter: Chapter) => {
    if (!structure || !basicSettings) return;

    try {
      const previousChapter = findPreviousChapter(generatedNovel!, chapter);

      const context: ChapterContext = {
        chapter: chapter,
        previousChapter: previousChapter
          ? {
              title: previousChapter.title,
              summary: previousChapter.summary,
              content: previousChapter.content || "",
            }
          : null,
        structure: structure,
      };

      const newChapter = await fetch(
        "/api/novel-generation/generateChapterContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ basicSettings, context, selectedLLM }),
        }
      ).then((res) => res.json());

      const updatedChapter = {
        ...chapter,
        content: newChapter.content,
      };

      // 生成されたチャプターで小説を更新
      setGeneratedNovel((current) =>
        current
          ? {
              ...current,
              children: updateChapterInTree(current.children, updatedChapter),
            }
          : null
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "チャプターの再生成中にエラーが発生しました"
      );
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
          body: JSON.stringify({ basicSettings, selectedLLM }),
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

    const totalChapters = countLeafChapters(generatedNovel);
    let completedChapters = 0;

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
          structure: structure,
        };

        const newChapter = await fetch(
          "/api/novel-generation/generateChapterContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ basicSettings, context, selectedLLM }),
          }
        ).then((res) => res.json());

        completedChapters++;
        const currentProgress = Math.floor(
          20 + (completedChapters / totalChapters) * 80
        );
        setProgress(currentProgress);
        setCurrentStep(`${completedChapters}/${totalChapters}チャプター完了`);

        const updatedChapter = {
          ...currentChapter,
          content: newChapter.content,
        };

        // 生成されたチャプターで小説を更新
        setGeneratedNovel((current) =>
          current
            ? {
                ...current,
                children: updateChapterInTree(current.children, updatedChapter),
              }
            : null
        );

        // 最終的な小説の状態を構築
        allLeafChapters[i] = updatedChapter;
        const processedNovel = await rebuildNovelStructure(
          generatedNovel,
          allLeafChapters
        );
        
        setProgress(100);
        setCurrentStep("完了");
        setGeneratedNovel(processedNovel);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "小説の生成中にエラーが発生しました"
        );
      } finally {
        setIsGenerating(false);
      }
    }
  };

  // 平坦化されたチャプターリストから元の階層構造を再構築
  const rebuildNovelStructure = async (
    originalStructure: Novel,
    leafChapters: Chapter[]
  ): Promise<Novel> => {
    let leafIndex = 0;

    const rebuildChapter = (chapter: Chapter): Chapter => {
      if (!chapter.children?.length) {
        const leaf = leafChapters[leafIndex];
        leafIndex++;
        return leaf;
      }
      return {
        ...chapter,
        children: chapter.children.map(rebuildChapter),
      };
    };

    return {
      ...originalStructure,
      children: originalStructure.children.map(rebuildChapter),
    };
  };

  const countLeafChapters = (novel: Novel | Chapter): number => {
    if ("children" in novel && novel.children) {
      return novel.children.reduce(
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

  // Novel更新用の関数を追加
  const handleNovelUpdate = (updatedNovel: Novel) => {
    setGeneratedNovel(updatedNovel);
    setStructure(updatedNovel);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
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
          <label className="block text-lg font-medium mb-2">基本設定</label>
          <textarea
            className="w-full h-40 p-4 border rounded-lg"
            value={basicSettings}
            onChange={(e) => setBasicSettings(e.target.value)}
            placeholder="小説の基本設定を入力してください..."
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
            {isGenerating ? "生成中..." : "基本生成"}
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
            {isGenerating ? "生成中..." : "本文生成"}
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
