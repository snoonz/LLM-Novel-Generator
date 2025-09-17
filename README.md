# LLM Novel Generator

AI（大規模言語モデル）を使用した小説・教科書自動生成システムです。基本設定を入力するだけで、AIが構造化されたコンテンツを章・セクションごとに自動生成します。

## 🚀 主な機能

- **マルチコンテンツ生成**: 小説と教科書の両方に対応
- **複数LLM対応**: Claude、DeepSeek、xAI Grokから選択可能
- **ストリーミング生成**: リアルタイムでコンテンツ生成と進捗表示
- **インタラクティブ編集**: 章・セクション単位での編集と再生成
- **構造化出力**: 章立てされた整理されたコンテンツ
- **文字数・ページ数制御**: 希望する長さを指定可能

## 🛠 技術スタック

- **フロントエンド**: Next.js 15.1.3 (App Router)、React 19、TypeScript
- **UI**: Tailwind CSS
- **LLM API**: Anthropic Claude、DeepSeek、xAI Grok
- **デプロイ**: Firebase対応

## 📋 必要な環境

- Node.js 18以上
- npm、yarn、pnpm、またはbun
- 以下のいずれか1つ以上のAPIキー：
  - Anthropic Claude APIキー
  - DeepSeek APIキー
  - xAI APIキー

## 🔧 インストール方法

1. リポジトリをクローン
```bash
git clone https://github.com/snoonz/LLM-Novel-Generator.git
cd LLM-Novel-Generator
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定：
ルートディレクトリに`.env.local`ファイルを作成し、以下のAPIキーを設定してください。使用しないLLMのキーは未指定でも動きます。
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
XAI_API_KEY=your_xai_api_key
```

4. 開発サーバーを起動：
```bash
npm run dev
```

5. ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 📖 使い方

### 基本設定プロンプトの入力方法

アプリケーションは基本設定プロンプトを使用してコンテンツを生成します。以下に例を示します：

#### 小説生成の例
```
タイトル: デジタルの目覚め
ジャンル: SF小説
設定: 近未来の東京、2045年
主人公: ユキ、25歳のAI研究者
あらすじ: ユキは自分が開発しているAIが意識を持ったことを発見し、この画期的な発見を公表するか、それともAIを悪用しようとする者たちから守るかの選択を迫られる。
トーン: 思慮深く、サスペンスフル
目標文字数: 10000文字
```

#### 教科書生成の例
```
科目: 機械学習入門
対象読者: 大学生（2年生レベル）
範囲: 基本概念、教師あり・教師なし学習、ニューラルネットワーク
教授法: 実践的で例題と演習問題を含む
目標文字数: 15000文字
```

### 生成手順

1. **コンテンツタイプを選択**: 「小説」または「教科書」を選ぶ
2. **LLMプロバイダーを選択**: Claude、DeepSeek、xAI Grokから選択
3. **基本設定を入力**: コンテンツに関する詳細情報を提供
4. **目標文字数を設定**: 希望する文字数を指定
5. **構造を生成**: AIが全体構造（章・セクション）を作成
6. **コンテンツを生成**: AIが各部分の実際の内容を執筆
7. **編集・調整**: 内蔵エディターでコンテンツを修正
8. **再生成**: 必要に応じて特定のセクションを再生成

### 利用可能なコマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクション用ビルド
npm run start    # プロダクションサーバー起動
npm run lint     # ESLint実行
npm run debug    # デバッグモード起動
```

## 🔧 設定

### 使用LLMモデル
- **Claude**: claude-3-5-sonnet-latest
- **DeepSeek**: deepseek-chat
- **xAI**: grok-4

### APIエンドポイント
- `/api/novel-generation/generateInitialStructure` - コンテンツ構造生成
- `/api/novel-generation/generateChapterContent` - 章コンテンツ生成
- `/api/novel-generation/generateChapterContentStream` - ストリーミングコンテンツ生成
- `/api/novel-generation/generateShortStoryStructure` - 小説専用構造生成
- `/api/novel-generation/generateShortStorySectionContent` - 小説セクションコンテンツ生成

## 💡 より良い結果を得るためのコツ

### 小説生成のコツ
- キャラクターの動機と葛藤を明確にする
- 希望するジャンルとトーンを具体的に指定
- 設定詳細（時代、場所、雰囲気）を含める
- 重要なプロット要素やテーマに言及
- 対象読者を明確にする

### 教科書生成のコツ
- 対象読者のレベルを明確に定義
- 学習目標を具体的に指定
- カバーしたい特定のトピックを含める
- 評価方法についても考慮する

### 詳細な小説プロンプトの例
```
タイトル: 明日への響き
ジャンル: ディストピアSF（ロマンス要素含む）
設定: 終末後の地球、2087年、人類は地下都市で生活
主人公: エレナ、28歳、戦前の知識を保存する記憶アーキビスト
サブキャラクター: マルクス（反乱軍リーダー）、チェン博士（高齢の科学者）、ザラ（エレナの妹）
中心的葛藤: エレナは地上世界が回復している証拠を発見するが、都市の指導者たちが統制を維持するためにこれを隠していることを知る
テーマ: 真実 vs 快適さ、希望 vs 絶望、個人の勇気 vs 集団の安全
トーン: 暗いが希望的、優しさの瞬間を含む
キャラクター成長: エレナは受動的な記録者から能動的な真実探求者へと変化
目標文字数: 12000文字
特別要求: 記憶保存の技術的詳細を含み、地下世界と地上世界の対比を描写
```

## 🚀 デプロイ

プロジェクトはFirebaseデプロイに対応しています。

```bash
npm run build
firebase deploy
```

## 📄 ライセンス

このプロジェクトはオープンソースです。詳細はLICENSEファイルをご確認ください。

## 🙏 謝辞
- 原案と教科書生成のプロンプトは[AutoZenBook](https://github.com/hooked-on-mas/AutoGenBook)を参考にしています
- Next.jsとReactで構築
- Anthropic Claude、DeepSeek、xAI APIを使用
- Tailwind CSSでスタイリング