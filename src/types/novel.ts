// 本全体のデータ
export interface Novel {
  title: string;
  summary: string;
  children: Chapter[];
}

// 章、文節のデータ。本の規模が大きい場合はchildrenにさらに章が入る
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
  structure: Novel | null;
}