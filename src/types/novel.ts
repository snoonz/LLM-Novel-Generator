// 教科書全体のデータ
export interface Textbook {
  title: string;
  summary: string;
  children: Chapter[];
}

// 章、文節のデータ。教科書の規模が大きい場合はchildrenにさらに章が入る
export interface Chapter {
  title: string;
  summary: string;
  n_pages: number;
  needsSubdivision: boolean;
  content?: string;
  children?: Chapter[];
}

// 前のチャプターの参照用データ
export interface PreviousChapter {
  title: string;
  summary: string;
  content: string;
}

// チャプター生成時のコンテキスト
export interface ChapterContext {
  chapter: Chapter;
  previousChapter: PreviousChapter | null;
  structure: Textbook | null;
}

// 小説用のセクション構造
export interface SectionStructure {
  title: string;
  summary: string;
  targetLength: number; // 文字数
  timeOfDay?: string; // 時間帯（朝、昼、夜など）
  location?: string; // 場所
  keyEvents: string[]; // 重要な出来事
  emotionalTone: string; // その場面の感情的トーン
  purposeInStory: string; // 物語全体における役割
}

// 小説全体の構造
export interface Novel {
  title: string;
  totalTargetLength: number;
  timespan: string;
  premise: string;
  climaxPoint: string;
  resolution: string;
  sections: NovelSection[];
}

// 小説のセクション
export interface NovelSection {
  sectionNumber: number;
  title: string;
  summary: string;
  targetLength: number;
  timeOfDay?: string;
  location?: string;
  keyEvents: string[];
  emotionalTone: string;
  purposeInStory: string;
  transitionNote: string;
  content?: string;
}

// 小説のコンテキスト情報
export interface NovelContext {
  previousSectionSummary?: string;
  currentMood: string;
  establishedFacts: string[];
  timeProgression: string;
  previousContent?: string;
}