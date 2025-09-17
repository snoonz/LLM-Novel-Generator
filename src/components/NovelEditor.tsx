import { Novel, NovelSection, Chapter, Textbook } from "@/types/novel";

interface NovelEditorProps {
  novel: Novel | Textbook;
  onUpdate: (updatedNovel: Novel | Textbook) => void;
}

export default function NovelEditor({ novel, onUpdate }: NovelEditorProps) {
  // データ構造判別関数
  const isNovel = (data: Novel | Textbook): data is Novel => {
    return 'sections' in data;
  };

  const updateChapter = (chapter: Chapter, updates: Partial<Chapter>) => {
    if (isNovel(novel)) return; // 小説の場合はチャプター更新なし
    
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

  const updateSection = (section: NovelSection, updates: Partial<NovelSection>) => {
    if (!isNovel(novel)) return; // 教科書の場合はセクション更新なし
    
    const updatedSections = novel.sections.map((sec) =>
      sec.sectionNumber === section.sectionNumber ? { ...sec, ...updates } : sec
    );

    onUpdate({
      ...novel,
      sections: updatedSections,
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

  const renderSectionEditor = (section: NovelSection) => (
    <div key={section.sectionNumber} className="mt-4 p-4 border rounded-lg">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">セクション番号</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={section.sectionNumber}
            onChange={(e) => updateSection(section, { sectionNumber: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">目標文字数</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={section.targetLength}
            onChange={(e) => updateSection(section, { targetLength: parseInt(e.target.value) })}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">タイトル</label>
        <input
          className="w-full p-2 border rounded"
          value={section.title}
          onChange={(e) => updateSection(section, { title: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">時間帯</label>
          <input
            className="w-full p-2 border rounded"
            value={section.timeOfDay || ''}
            onChange={(e) => updateSection(section, { timeOfDay: e.target.value })}
            placeholder="朝、昼、夕方、夜など"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">場所</label>
          <input
            className="w-full p-2 border rounded"
            value={section.location || ''}
            onChange={(e) => updateSection(section, { location: e.target.value })}
            placeholder="具体的な場所"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">感情的トーン</label>
          <input
            className="w-full p-2 border rounded"
            value={section.emotionalTone}
            onChange={(e) => updateSection(section, { emotionalTone: e.target.value })}
            placeholder="緊張、平穏、不安、希望など"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">物語における役割</label>
          <input
            className="w-full p-2 border rounded"
            value={section.purposeInStory}
            onChange={(e) => updateSection(section, { purposeInStory: e.target.value })}
            placeholder="導入、展開、クライマックス、結末など"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">セクション概要</label>
        <textarea
          className="w-full p-2 border rounded h-24"
          value={section.summary}
          onChange={(e) => updateSection(section, { summary: e.target.value })}
          placeholder="このセクションで起こる出来事と展開"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">重要な出来事</label>
        <textarea
          className="w-full p-2 border rounded h-16"
          value={section.keyEvents.join('\n')}
          onChange={(e) => updateSection(section, { 
            keyEvents: e.target.value.split('\n').filter(Boolean) 
          })}
          placeholder="重要な出来事を1行に1つずつ記入"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">次への繋がり</label>
        <textarea
          className="w-full p-2 border rounded h-16"
          value={section.transitionNote}
          onChange={(e) => updateSection(section, { transitionNote: e.target.value })}
          placeholder="次のセクションへの繋がり方"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">本文</label>
        <textarea
          className="w-full p-2 border rounded h-64"
          value={section.content || ''}
          onChange={(e) => updateSection(section, { content: e.target.value })}
          placeholder="セクションの本文内容"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <input
        className="w-full p-2 border rounded text-2xl font-bold"
        value={novel.title}
        onChange={(e) => onUpdate({ ...novel, title: e.target.value })}
      />
      
      {isNovel(novel) ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">目標文字数</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={novel.totalTargetLength}
                onChange={(e) => onUpdate({ ...novel, totalTargetLength: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">時代設定</label>
              <input
                className="w-full p-2 border rounded"
                value={novel.timespan}
                onChange={(e) => onUpdate({ ...novel, timespan: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">あらすじ</label>
            <textarea
              className="w-full p-2 border rounded h-20"
              value={novel.premise}
              onChange={(e) => onUpdate({ ...novel, premise: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">クライマックス</label>
            <textarea
              className="w-full p-2 border rounded h-16"
              value={novel.climaxPoint}
              onChange={(e) => onUpdate({ ...novel, climaxPoint: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">結末の方向性</label>
            <textarea
              className="w-full p-2 border rounded h-16"
              value={novel.resolution}
              onChange={(e) => onUpdate({ ...novel, resolution: e.target.value })}
            />
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">セクション編集</h3>
            {novel.sections.map((section) => renderSectionEditor(section))}
          </div>
        </>
      ) : (
        <>
          <textarea
            className="w-full p-2 border rounded"
            value={novel.summary}
            onChange={(e) => onUpdate({ ...novel, summary: e.target.value })}
          />
          {novel.children.map((chapter) => renderChapterEditor(chapter))}
        </>
      )}
    </div>
  );
}
