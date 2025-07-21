# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**t-note** - スレッド形式記録アプリケーション

認証済みユーザーが Topic を作成し、スレッド形式で返信を投稿できる Web アプリケーション。マークダウン対応、タグ付け、投稿編集・削除機能を備える。

## 開発フェーズと現在の状況

プロジェクトは企画・要件定義段階を完了し、これから実装段階に入る。詳細な要件定義と実装計画は `TODO.md` に記載されている。

## 技術スタック

- **フレームワーク**: Remix（React-based）
- **データベース**: SQLite（開発用）、Prisma ORM
- **スタイリング**: Tailwind CSS
- **マークダウン**: React Markdown
- **テスト**: Vitest + @testing-library/react + Playwright
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

## 重要な制約

- サインアップ機能は実装しない（認証済みユーザーのみ）
- 投稿編集・削除は投稿者本人のみ可能
- 全ての投稿内容はマークダウン形式で保存
- スレッド構造は parent_post_id で実現
