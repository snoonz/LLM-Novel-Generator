import { Novel, Chapter } from '@/types/novel';
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface NovelDisplayProps {
  novel: Novel;
  onRegenerateChapter: (chapter: Chapter) => Promise<void>;
}

export default function NovelDisplay({ novel, onRegenerateChapter }: NovelDisplayProps) {
  const [displayMode, setDisplayMode] = useState<'full' | 'simple'>('full');
  const [regeneratingChapters, setRegeneratingChapters] = useState<Set<string>>(new Set());

  // すべての本文を連結する関数
  const getAllContent = (chapters: Chapter[]): string => {
    return chapters.map(chapter => {
      if (chapter.children) {
        return getAllContent(chapter.children);
      }
      return chapter.content || '';
    }).filter(Boolean).join('\n\n');
  };

  // テキストをクリップボードにコピーする関数
  const handleCopy = () => {
    const title = novel.title;
    const content = getAllContent(novel.children);
    const textToCopy = `${title}\n\n${content}`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // オプション: コピー成功を示す視覚的フィードバックを実装可能
      });
  };

  // チャプター再生成のハンドラー
  const handleRegenerate = async (chapter: Chapter) => {
    setRegeneratingChapters(prev => new Set([...prev, chapter.title]));
    try {
      await onRegenerateChapter(chapter);
    } finally {
      setRegeneratingChapters(prev => {
        const next = new Set(prev);
        next.delete(chapter.title);
        return next;
      });
    }
  };

  // 特定のフレーズを強調表示するための関数
  const highlightText = (text: string) => {
    const phrase = "申し訳ありません";
    const parts = text.split(phrase);
    
    if (parts.length === 1) return text;
    
    return (
      <>
        {parts.map((part, index) => (
          <>
            {part}
            {index < parts.length - 1 && (
              <span className="bg-red-200 px-1 rounded">
                {phrase}
              </span>
            )}
          </>
        ))}
      </>
    );
  };

  const renderParagraph = (text: string, key: number) => (
    <p key={key} className="mb-4">
      {highlightText(text)}
    </p>
  );

// 詳細表示モード用の再帰的なチャプター表示
const renderChapter = (chapter: Chapter, level: number = 1) => {
  const isRegenerating = regeneratingChapters.has(chapter.title);

  return (
    <div key={chapter.title} className="mt-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-${4-level}xl font-bold mb-2`}>{chapter.title}</h3>
        {!chapter.children && (
          <button
            onClick={() => handleRegenerate(chapter)}
            disabled={isRegenerating}
            className={`flex items-center space-x-2 px-3 py-1 rounded text-sm ${
              isRegenerating 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
            }`}
          >
            <RefreshCw 
              className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} 
            />
            <span>{isRegenerating ? '生成中...' : '再生成'}</span>
          </button>
        )}
      </div>
      { chapter.summary && (
        <div className="prose max-w-none">
          <p className="mb-4 text-gray-500">
            {chapter.summary}
          </p>
        </div>
      )}
      {chapter.content && (
          <div className="prose max-w-none">
            {chapter.content.split('\n').map((paragraph, index) => 
              renderParagraph(paragraph, index)
            )}
          </div>
        )}
      {chapter.children && (
        <div className="ml-4">
          {chapter.children.map(child => renderChapter(child, level + 1))}
        </div>
      )}
    </div>
  );
};

// シンプル表示モード用のコンテンツ表示
const renderSimpleView = () => {
  const fullContent = getAllContent(novel.children);
  return (
    <div className="prose max-w-none">
      {fullContent.split('\n').map((paragraph, index) => 
          renderParagraph(paragraph, index)
        )}
    </div>
  );
};

return (
  <div className="mt-8">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-4xl font-bold">{novel.title}</h1>
      <div className="flex items-center space-x-4">
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2"
        >
          <span>本文をコピー</span>
        </button>
        <button
          onClick={() => setDisplayMode('simple')}
          className={`px-4 py-2 rounded ${
            displayMode === 'simple' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          本文のみ
        </button>
        <button
          onClick={() => setDisplayMode('full')}
          className={`px-4 py-2 rounded ${
            displayMode === 'full' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          詳細表示
        </button>
      </div>
    </div>
    <p className="text-xl mb-8">{novel.summary}</p>
    {displayMode === 'full' ? (
      novel.children.map(chapter => renderChapter(chapter))
    ) : (
      renderSimpleView()
    )}
  </div>
);
}