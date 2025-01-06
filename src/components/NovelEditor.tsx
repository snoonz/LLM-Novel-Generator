import { Novel, Chapter } from "@/types/novel";

interface NovelEditorProps {
  novel: Novel;
  onUpdate: (updatedNovel: Novel) => void;
}

export default function NovelEditor({ novel, onUpdate }: NovelEditorProps) {
  const updateChapter = (chapter: Chapter, updates: Partial<Chapter>) => {
    const updateChapterInTree = (chapters: Chapter[]): Chapter[] => {
      return chapters.map((ch) => {
        if (ch.title === chapter.title) {
          return { ...ch, ...updates };
        }
        if (ch.children) {
          return { ...ch, children: updateChapterInTree(ch.children) };
        }
        return ch;
      });
    };

    onUpdate({
      ...novel,
      children: updateChapterInTree(novel.children),
    });
  };

  const renderChapterEditor = (chapter: Chapter) => (
    <div key={chapter.title} className="mt-4 p-4 border rounded-lg">
      <input
        className="w-full p-2 border rounded mb-2"
        value={chapter.title}
        onChange={(e) => updateChapter(chapter, { title: e.target.value })}
      />
      <input
        type="number"
        className="w-24 p-2 border rounded"
        value={chapter.n_pages}
        onChange={(e) =>
          updateChapter(chapter, { n_pages: parseInt(e.target.value) })
        }
      />
      <textarea
        className="w-full p-2 border rounded mb-2"
        value={chapter.summary}
        onChange={(e) => updateChapter(chapter, { summary: e.target.value })}
      />
      {!chapter.children && (
        <textarea
          className="w-full p-2 border rounded"
          value={chapter.content}
          onChange={(e) => updateChapter(chapter, { content: e.target.value })}
        />
      )}
      {chapter.children && (
        <div className="ml-4">
          {chapter.children.map((child) => renderChapterEditor(child))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <input
        className="w-full p-2 border rounded text-2xl font-bold"
        value={novel.title}
        onChange={(e) => onUpdate({ ...novel, title: e.target.value })}
      />
      <textarea
        className="w-full p-2 border rounded"
        value={novel.summary}
        onChange={(e) => onUpdate({ ...novel, summary: e.target.value })}
      />
      {novel.children.map((chapter) => renderChapterEditor(chapter))}
    </div>
  );
}
