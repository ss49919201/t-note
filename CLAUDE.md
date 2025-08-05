# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**t-note** - スレッド形式記録アプリケーション

認証済みユーザーが Topic を作成し、スレッド形式で返信を投稿できる Web アプリケーション。マークダウン対応、タグ付け、投稿編集・削除機能を備える。

## 開発フェーズと現在の状況

プロジェクトは企画・要件定義段階を完了し、これから実装段階に入る。詳細な要件定義と実装計画は `TODO.md` に記載されている。

## 技術スタック

- **フレームワーク**: React Router
- **データベース**: D1（Cloudflare）、Drizzle ORM
- **スタイリング**: Tailwind CSS
- **テスト**: Vitest + @testing-library/react
- **認証**: セッション管理

## 開発手法

**TDD（Test-Driven Development）** を厳格に適用：

- 全ての新機能はテストファーストで実装
- Red → Green → Refactor のサイクルを厳守
- 各サブタスクにテスト実装を含める

## データ構造

```
User: id, username, email, created_at
Topic: id, title, content(markdown), user_id, tags, created_at
Post: id, content(markdown), topic_id, parent_post_id, user_id, created_at
Tag: id, name
```

## コマンド（開発開始後に更新予定）

プロジェクト初期化後、以下のコマンドが利用可能になる予定：

```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm run test
npm run test:watch

# E2Eテスト
npm run test:e2e

# ビルド
npm run build

# Linting
npm run lint
npm run typecheck

# データベース操作
npx prisma migrate dev
npx prisma studio
```

## 実装優先順位

1. **Phase 1**: Remix プロジェクト初期化、DB 設定、認証システム
2. **Phase 2**: Topic 作成、スレッド投稿、マークダウン対応
3. **Phase 3**: タグ付け、編集・削除機能
4. **Phase 4**: 統合テスト、パフォーマンス最適化

Phase ごとのサブタスクが完了するたびに、ユーザーにレビューを依頼する。
承認されれば`TODO.md` を更新し、進捗を記録する。

## 重要な制約

- サインアップ機能は実装しない（認証済みユーザーのみ）
- 投稿編集・削除は投稿者本人のみ可能
- 全ての投稿内容はプレーンテキスト形式で保存
- スレッド構造は parent_post_id で実現

## TypeScript 型安全性の厳格な遵守

**`any` 型の使用を絶対に禁止する**

### なぜ `any` を避けるべきか

1. **型安全性の破綻**: TypeScript の最大の利点である静的型チェックを無効化し、実行時エラーのリスクを大幅に増大させる
2. **開発体験の劣化**: IDE の IntelliSense、自動補完、リファクタリング支援が完全に機能しなくなる
3. **保守性の悪化**: コードの意図が不明確になり、将来的な変更時にバグを引き起こしやすくなる
4. **技術的負債の蓄積**: 一時的な解決策として使用されても、後で適切な型定義が必要になり、作業コストが倍増する

### 代替アプローチ

- **既存型の活用**: `model/topic.ts` の `Topic`, `Post`, `User` 型を最大限活用する
- **Union型**: `string | null`, `Topic | undefined` など具体的な型の組み合わせを使用
- **`unknown`型**: 型が不明な場合は `any` ではなく `unknown` を使用し、型ガードで安全に処理
- **部分型**: `Partial<Topic>`, `Pick<Topic, 'id' | 'title'>` などユーティリティ型を活用
- **明示的な型定義**: 新しい型が必要な場合は interface や type で明確に定義

### 実装例

```typescript
// ❌ 絶対にダメ
const topics: any[] = [];

// ✅ 既存型を活用
const topics: Topic[] = [];

// ✅ Union型で明確に
const topic: Topic | null = null;

// ✅ 不明な型は unknown で安全に
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // 型ガードで安全に処理
  }
}
```

この制約により、コードベース全体の品質と保守性を確保し、実行時エラーを最小限に抑える。
