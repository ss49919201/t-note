# コードスタイル・規約

## TypeScript 規約

### 型安全性の厳格な遵守
- **`any`型の使用を絶対に禁止**
- `unknown`型を使用し、型ガードで安全に処理
- Union型: `string | null`, `Topic | undefined` を活用
- 部分型: `Partial<Topic>`, `Pick<Topic, 'id' | 'title'>` を活用
- 既存の型定義(`model/topic.ts`, `model/user.ts`)を最大限活用

### TypeScript設定
- `strict: true` モードを使用
- `verbatimModuleSyntax: true` でモジュール構文を厳密に
- `checkJs: true` でJavaScriptファイルもチェック
- `skipLibCheck: true` でライブラリの型チェックをスキップ

## バリデーション

### Valibot使用
- 全データバリデーションにValibotスキーマを使用
- `model/`ディレクトリで型定義とスキーマを管理
- 型推論: `v.InferOutput<typeof Schema>` を使用

### スキーマ例
```typescript
export const TopicSchema = v.object({
  id: v.string(),
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  content: v.pipe(v.string(), v.minLength(1)),
  // ...
});

export type Topic = v.InferOutput<typeof TopicSchema>;
```

## テストスタイル

### TDD (Test-Driven Development)
- Red → Green → Refactor サイクルを厳守
- テストファーストで実装
- Vitest + describe/test/expect パターン

### テストファイル例
```typescript
import { describe, test, expect, beforeEach } from "vitest";

describe("TopicService", () => {
  let topicService: TopicService;

  beforeEach(() => {
    topicService = new TopicService();
  });

  test("有効なデータでTopicサービスが初期化される", () => {
    expect(topicService).toBeDefined();
  });
});
```

## アーキテクチャパターン

### Event Sourcing
- イベントストア: `topic_events`, `post_events`
- 読み込み用ビュー: `topics_view`, `posts_view`
- コマンド/イベント分離

### ファイル命名規約
- サーバーサイドコード: `*.server.ts`
- テストファイル: `*.test.ts`
- 型定義: `model/` ディレクトリ
- コンポーネント: PascalCase

## React Router設定
- SSR対応: `ssr: true`
- 未来フラグ: `unstable_viteEnvironmentApi: true`

## 設定ファイル
- TypeScript: プロジェクト参照構成を使用
- Vitest: `node_modules`, `.wrangler` を除外
- Claude Code: Edit/Write時に`npm run typecheck`自動実行

## コーディング原則
1. 型安全性を最優先
2. TDDサイクルの厳守  
3. 既存パターンの踏襲
4. 明示的な型定義
5. バリデーションの徹底