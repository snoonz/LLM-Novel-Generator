import "@/styles/globals.css";
export const metadata = {
  title: 'AI小説ジェネレーター',
  description: 'LLMを使った小説作成アプリ。指示を元に構造を作成し、それに従って小説を生成します。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
