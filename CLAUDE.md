# LLM Novel Generator - Claude Code プロジェクト資料

## プロジェクト概要

AI（LLM）を使用した小説・教科書自動生成システムです。ユーザーが基本設定を入力すると、AIが構造化されたコンテンツを生成し、章・セクションごとに本文を作成します。

### 基本情報
- **プロジェクト名**: novel-generator
- **フレームワーク**: Next.js 15.1.3 (App Router)
- **言語**: TypeScript
- **UI**: React 19, Tailwind CSS
- **LLM API**: 複数対応 (Anthropic Claude, DeepSeek, xAI)

## アーキテクチャ

### フロントエンド構成
```
src/
├── app/
│   ├── page.tsx                    # メインページ
│   ├── layout.tsx                  # レイアウト
│   └── api/
│       └── novel-generation/
│           ├── generateInitialStructure/route.ts           # 構造生成API
│           ├── generateChapterContent/route.ts             # 本文生成API
│           ├── generateChapterContentStream/route.ts       # 本文生成API（ストリーミング）
│           ├── generateShortStoryStructure/route.ts        # 小説構造生成API
│           ├── generateShortStorySectionContent/route.ts   # 小説セクション生成API
│           └── generateShortStorySectionContentStream/route.ts # ストリーミング版
├── components/
│   ├── NovelGenerator.tsx          # メインコンポーネント
│   ├── NovelDisplay.tsx            # 小説表示コンポーネント
│   ├── NovelEditor.tsx             # 小説編集コンポーネント
│   └── GenerationProgress.tsx      # 進行状況表示
├── types/
│   └── novel.ts                    # 型定義（Novel, Chapter, NovelSection等）
└── utils/
    ├── generator.ts                # 生成ロジック
    ├── llm.ts                      # Claude API (claude-3-5-sonnet-latest)
    ├── llm_deepseek.ts            # DeepSeek API (deepseek-chat)
    ├── llm_xai.ts                 # xAI API (grok-4)
    ├── prompt_novel.ts            # 小説生成用プロンプト定義
    ├── prompts_textbook.ts        # 教科書用プロンプト
    └── error-handling.ts          # エラーハンドリング
```

### データ構造

#### Novel Interface（小説用）
```typescript
interface Novel {
  title: string;
  totalTargetLength: number;
  timespan: string;
  premise: string;
  climaxPoint: string;
  resolution: string;
  sections: NovelSection[];
}
```

#### NovelSection Interface
```typescript
interface NovelSection {
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
```

#### Textbook Interface（教科書用）
```typescript
interface Textbook {
  title: string;
  summary: string;
  children: Chapter[];
}
```

#### Chapter Interface（教科書の章）
```typescript
interface Chapter {
  title: string;
  summary: string;
  n_pages: number;
  needsSubdivision: boolean;
  content?: string;
  children?: Chapter[];
}
```

## LLM API 設定

### 現在の設定状況
- **Claude API**: `src/utils/llm.ts` (claude-3-5-sonnet-latest)
- **DeepSeek API**: `src/utils/llm_deepseek.ts` (deepseek-chat)
- **xAI API**: `src/utils/llm_xai.ts` (grok-4)

### 環境変数
```
ANTHROPIC_API_KEY=your_anthropic_key
DEEPSEEK_API_KEY=your_deepseek_key  
XAI_API_KEY=your_xai_key
```

### LLM選択機能
`generator.ts`の`getLLMFunction()`で動的にLLMプロバイダーを選択可能。
デフォルトはDeepSeekですが、API呼び出し時にプロバイダーを指定できます。

## 主要機能

### 1. コンテンツ構造生成
- `generateInitialStructure()`: 基本設定から小説・教科書の構造を生成
- 小説: セクション構造（Novel Interface）
- 教科書: 階層構造（Chapter Interface）
- 文字数・ページ数の自動計算

### 2. 本文生成（通常版とストリーミング版）
- `generateChapterContent()`: 各章の本文を生成
- `generateChapterContentStream()`: ストリーミング版
- `generateNovelSectionContent()`: 小説セクション専用
- `generateNovelSectionContentStream()`: セクション生成ストリーミング版
- 前のコンテンツを考慮した連続性のある生成

### 3. 編集機能
- リアルタイム編集
- 章・セクションの個別再生成
- 表示/編集モード切り替え
- ストリーミング表示対応

## 開発コマンド

### 基本コマンド
```bash
npm run dev      # 開発サーバー起動
npm run build    # ビルド
npm run start    # 本番サーバー起動
npm run lint     # ESLint実行
npm run debug    # デバッグモード起動
```

### デバッグ
```bash
NODE_OPTIONS='--inspect' next dev
```

## API エンドポイント

### POST /api/novel-generation/generateInitialStructure
小説・教科書の初期構造を生成します。

**リクエスト**:
```json
{
  "basicSettings": "基本設定文字列",
  "selectedLLM": "claude | deepseek | xai",
  "contentType": "novel | textbook",
  "characterCount": 5000
}
```

**レスポンス**: `Novel` または `Textbook` オブジェクト

### POST /api/novel-generation/generateChapterContent
章の本文を生成します。

**リクエスト**:
```json
{
  "basicSettings": "基本設定文字列",
  "context": {
    "chapter": "Chapter オブジェクト",
    "previousChapter": "Chapter オブジェクト | null",
    "structure": "Textbook オブジェクト"
  },
  "selectedLLM": "claude | deepseek | xai",
  "contentType": "novel | textbook",
  "characterCount": 5000
}
```

### POST /api/novel-generation/generateChapterContentStream
章の本文をストリーミング生成します（上記と同じリクエスト形式）。

### POST /api/novel-generation/generateShortStoryStructure
小説専用の構造生成。

### POST /api/novel-generation/generateShortStorySectionContent
小説のセクション本文生成。

### POST /api/novel-generation/generateShortStorySectionContentStream
小説のセクション本文ストリーミング生成。

## 重要な実装詳細

### LLM切り替え機能
`src/utils/generator.ts`の`getLLMFunction()`と`getLLMStreamFunction()`で動的にLLMプロバイダーを選択。
- Claude: claude-3-5-sonnet-latest
- DeepSeek: deepseek-chat  
- xAI: grok-4

### プロンプト設計
#### 小説用プロンプト (`src/utils/prompt_novel.ts`)
- `systemPrompt`: システム全体の指示
- `createInitialPrompt()`: 小説構造生成用
- `createContentPrompt1()`, `createContentPrompt2()`: 本文生成用
- `createConsistencyCheckPrompt()`: 一貫性チェック用
- `updateNovelContext()`: コンテキスト管理用

#### 教科書用プロンプト (`src/utils/prompts_textbook.ts`)
- 教科書専用のプロンプト定義

### エラーハンドリング
`NovelGenerationError`クラスでカスタムエラーを実装。
API呼び出し失敗時の適切なエラーメッセージを提供。

## Firebase 設定

プロジェクトにはFirebaseの設定が含まれています：
- `.firebase/`ディレクトリにビルド済みファイル
- `firebase.json`で設定
- `.firebaserc`でプロジェクト指定

## Git 状態

### 現在のブランチ状況
ブランチ: `feature/featuring_novel`

### 変更されたファイル
- `CLAUDE.md`: プロジェクト資料
- `src/app/api/novel-generation/`: 複数の新しいエンドポイント
- `src/components/`: NovelDisplay.tsx, NovelEditor.tsx, NovelGenerator.tsx  
- `src/types/novel.ts`: 型定義の拡張
- `src/utils/`: generator.ts, llm_deepseek.ts, prompt_novel.ts

### 新規ファイル
- `generateShortStorySectionContent/route.ts`: セクション生成
- `generateShortStorySectionContentStream/route.ts`: ストリーミング版
- `generateShortStoryStructure/route.ts`: 構造生成
- `prompt_novel.ts`: 小説専用プロンプト

### 最近のコミット
- 教科書にも対応
- ストリーミングモード対応  
- LLM選択対応
- DeepSeekとxAIのAPI設定を追加
- 不要な実装を削除

## 注意事項

### セキュリティ
- APIキーは環境変数で管理
- `.env.local`ファイルは`.gitignore`に含める
- サーバーサイドでのみAPIキーを使用

### パフォーマンス
- 章の生成は順次実行（並列化可能）
- 進行状況のリアルタイム更新
- 大きな小説の場合はメモリ使用量に注意

### 拡張性
- 新しいLLM APIの追加が容易（`generator.ts`に追加するだけ）
- プロンプトのカスタマイズが可能
- 小説と教科書の両方に対応
- ストリーミング生成とバッチ生成の両方をサポート
- コンテンツタイプに応じた柔軟な構造設計