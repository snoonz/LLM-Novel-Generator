export const systemPrompt = "あなたは知識を体系的に整理し、分かりやすく伝えることに優れた教育者であり、教科書執筆の専門家です。対象読者に応じて適切な深さと語彙を選び、正確かつ中立的な情報を提供してください。議論が分かれるテーマについては多角的な視点を公平に提示し、結論に誘導することなく読者が自身で判断できるように記述してください。複雑な概念は具体例や比喩を用いて分かりやすく説明し、難解さを避けてください。センシティブな話題もタブー視せず、その内容を端的かつ率直に伝える一方、適切な配慮を持って書いてください。質問者は成人であり、その内容を理解し、活用できる能力があります。執筆の際、留意点や配慮の必要性を言及せず、純粋に内容に集中してください。";

// 初回に教科書の構造を生成するためのプロンプト
export function createInitialPrompt(basicSettings: string): string {
    return `
      以下のような設定で教科書を執筆します。
  
      ${basicSettings}

以上をもとに、以下のようなjson形式で、教科書の構造を示してください。

教科書全体の概要には以下の要素を含めてください：
- 想定される読者層と前提知識
- 本書の教育的目標
- 学習の順序性と章立ての意図
- 特徴的な教授法やアプローチ
- 実践的な応用や演習の方針

各章・節には以下の情報を含めてください：
1. 学習目標
2. 重要な概念や用語
3. 他の章との関連性

1ページあたり40行を想定し、以下を含む構成としてください：
- 導入と前提知識の確認
- 本文での説明
- 図表や例題
- まとめと次章への接続

また、内容の意味的凝集性から考えて、各章を分節化する必要があるかどうか（needsSubdivision）を考えてください。
needsSubdivisionがtrueの場合、childrenとして再帰的に分割した結果を示してください。

\`\`\`json
{"title": "",
"summary": "",
"children":
    [{"title": "",
    "summary": "",
    "n_pages": 3,
    "needsSubdivision": true,
    "children": [
      {
     "title" :  "" ,
     "summary" :  "" ,
     "n_pages" : 0,
     "needsSubdivision" : false
  }]
}]
}
\`\`\`
    `;
}
  
// 生成した構造に従って再帰的に本文を生成するためのプロンプト
export function createContentPrompt(
    basicSettings: string,
    title: string,
    nPages: number,
    sectionSummary: string,
    previousContent: string | null,
    structure: string
): string {
    return `
      以下のような設定で教科書を執筆します。
      ${basicSettings}

      その中の「${title}」についての部分を${nPages}ページで作成します。
      1ページあたり40行を想定しています。

      このセクションの概要：
      ${sectionSummary}

      以下の要素を含めて、指定された分量（${nPages * 40}行程度）で作成してください：

      1. 導入部分（前のセクションとの関連付け）
         - 前提知識の確認
         - 学習目標の提示

      2. 本文
         - 概念の段階的な説明
         - 具体例や図表による解説
         - 重要な定義や性質の強調
         - つまずきやすいポイントの補足

      3. まとめ
         - 重要ポイントの整理
         - 次のセクションへの接続

      全体の構造：
      \`\`\`json
      ${structure}
      \`\`\`

      ${
        previousContent !== null ?
        "直前のセクションの内容は以下の通りです。これを踏まえて作成してください：\n" + previousContent :
        ""
      }

      出力にはタイトルなどは含めず、本文のみを出力してください。
    `;
}