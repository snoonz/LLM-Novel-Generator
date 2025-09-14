# LLM Novel Generator - Claude Code プロジェクト資料

## プロジェクト概要

AI（LLM）を使用した小説自動生成システムです。ユーザーが基本設定を入力すると、AIが構造化された小説を生成し、章ごとに本文を作成します。

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
│           ├── generateInitialStructure/route.ts  # 構造生成API
│           └── generateChapterContent/route.ts    # 本文生成API
├── components/
│   ├── NovelGenerator.tsx          # メインコンポーネント
│   ├── NovelDisplay.tsx            # 小説表示コンポーネント
│   ├── NovelEditor.tsx             # 小説編集コンポーネント
│   └── GenerationProgress.tsx      # 進行状況表示
├── types/
│   └── novel.ts                    # 型定義
└── utils/
    ├── generator.ts                # 生成ロジック
    ├── llm.ts                      # Claude API (コメントアウト)
    ├── llm_deepseek.ts            # DeepSeek API
    ├── llm_xai.ts                 # xAI API
    ├── prompts_novel.ts           # プロンプト定義
    ├── prompts_textbook.ts        # 教科書用プロンプト
    └── error-handling.ts          # エラーハンドリング
```

### データ構造

#### Novel Interface
```typescript
interface Novel {
  title: string;
  summary: string;
  children: Chapter[];
}
```

#### Chapter Interface
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
- **Claude API**: `src/utils/llm.ts` (コメントアウト済み)
- **DeepSeek API**: `src/utils/llm_deepseek.ts` (アクティブ)
- **xAI API**: `src/utils/llm_xai.ts` (利用可能)

### 環境変数
```
ANTHROPIC_API_KEY=your_anthropic_key
DEEPSEEK_API_KEY=your_deepseek_key  
XAI_API_KEY=your_xai_key
```

## 主要機能

### 1. 小説構造生成
- `generateInitialStructure()`: 基本設定から小説の章立て構造を生成
- 階層構造をサポート（章→節→小節）
- ページ数の自動計算

### 2. 本文生成
- `generateChapterContent()`: 各章の本文を生成
- 前章の内容を考慮した連続性のある生成
- 指定ページ数に合わせた分量調整

### 3. 編集機能
- リアルタイム編集
- 章の個別再生成
- 表示/編集モード切り替え

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
小説の初期構造を生成します。

**リクエスト**:
```json
{
  "basicSettings": "小説の基本設定文字列"
}
```

**レスポンス**: `Novel` オブジェクト

### POST /api/novel-generation/generateChapterContent
章の本文を生成します。

**リクエスト**:
```json
{
  "basicSettings": "小説の基本設定文字列",
  "context": {
    "chapter": "Chapter オブジェクト",
    "previousChapter": "PreviousChapter オブジェクト | null",
    "structure": "Novel オブジェクト"
  }
}
```

## 重要な実装詳細

### LLM切り替え
現在はDeepSeek APIを使用中。`src/utils/generator.ts`で`callLLM`をインポートして使用。
他のLLMに切り替える場合は、インポート元を変更するだけで対応可能。

### プロンプト設計
`src/utils/prompts_novel.ts`に以下のプロンプトを定義:
- `systemPrompt`: システム全体の指示
- `createInitialPrompt()`: 構造生成用
- `createContentPrompt1()`, `createContentPrompt2()`: 本文生成用

### エラーハンドリング
`NovelGenerationError`クラスでカスタムエラーを実装。
API呼び出し失敗時の適切なエラーメッセージを提供。

## Firebase 設定

プロジェクトにはFirebaseの設定が含まれています：
- `.firebase/`ディレクトリにビルド済みファイル
- `firebase.json`で設定
- `.firebaserc`でプロジェクト指定

## Git 状態

### 現在の変更
- `src/utils/llm.ts`: Claude APIコード（コメントアウト）
- `src/utils/llm_deepseek.ts`: DeepSeek API実装

### 最近のコミット
- DeepSeekとxAIのAPI設定を追加
- 不要な実装を削除
- 初期コミット

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
- 新しいLLM APIの追加が容易
- プロンプトのカスタマイズが可能
- 教科書生成機能の基盤も含まれている（`prompts_textbook.ts`）