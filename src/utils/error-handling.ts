export type GenerationStep = 
  | '初期構造生成'
  | '章の細分化'
  | '本文生成'
  | 'API呼び出し'
  | 'JSONパース'
  | '不明';

export class NovelGenerationError extends Error {
  constructor(
    message: string,
    public step: GenerationStep,
    public originalError?: Error,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'NovelGenerationError';

    // Error クラスを継承する際の TypeScript での推奨パターン
    Object.setPrototypeOf(this, NovelGenerationError.prototype);

    // スタックトレースの保持
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NovelGenerationError);
    }

    // 元のエラーのスタックトレースを含める
    if (originalError?.stack) {
      this.stack = `${this.stack}\nCaused by:\n${originalError.stack}`;
    }
  }

  // エラーメッセージをフォーマットするメソッド
  public getFormattedMessage(): string {
    let message = `${this.step}ステップでエラーが発生しました: ${this.message}`;
    if (this.context) {
      message += `\n追加情報: ${JSON.stringify(this.context, null, 2)}`;
    }
    return message;
  }

  // ユーザーに表示するためのメッセージを取得するメソッド
  public getUserMessage(): string {
    const baseMessage = `${this.step}中にエラーが発生しました。`;
    switch (this.step) {
      case 'API呼び出し':
        return `${baseMessage}しばらく待ってから再度お試しください。`;
      case 'JSONパース':
        return `${baseMessage}システム管理者に連絡してください。`;
      default:
        return `${baseMessage}もう一度やり直してください。`;
    }
  }
}

// エラーハンドリングのユーティリティ関数
export function handleApiError(error: unknown, step: GenerationStep, context?: Record<string, unknown>): never {
  if (error instanceof NovelGenerationError) {
    throw error; // 既にNovelGenerationErrorの場合はそのままスロー
  }

  if (error instanceof Error) {
    throw new NovelGenerationError(
      error.message,
      step,
      error,
      context
    );
  }

  throw new NovelGenerationError(
    '予期せぬエラーが発生しました',
    step,
    undefined,
    { ...context, originalError: error }
  );
}

// エラーメッセージをログに記録するユーティリティ
export function logError(error: unknown): void {
  if (error instanceof NovelGenerationError) {
    console.error(`[${error.step}] ${error.getFormattedMessage()}`);
    if (error.originalError) {
      console.error('Original error:', error.originalError);
    }
    if (error.context) {
      console.error('Context:', error.context);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}