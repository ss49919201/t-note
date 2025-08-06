# プロジェクト概要

## プロジェクト名
**t-note** - スレッド形式記録アプリケーション

## プロジェクトの目的
認証済みユーザーがTopicを作成し、スレッド形式で返信を投稿できるWebアプリケーション。マークダウン対応、タグ付け、投稿編集・削除機能を備える。

## 技術スタック

### フロントエンド・フレームワーク
- **React Router v7** (SSR対応)
- **React 19**
- **TypeScript** (strictモード)

### データベース・ORM
- **Cloudflare D1** (SQLite)
- **Drizzle ORM**
- **イベントソーシング アーキテクチャ**

### バリデーション・型安全性
- **Valibot** (スキーマバリデーション)
- **TypeScript strict モード**

### スタイリング
- **Tailwind CSS v4**

### テスト
- **Vitest** (ユニットテスト)
- **TDD (Test-Driven Development)**

### デプロイ・インフラ
- **Cloudflare Workers**
- **Wrangler CLI**

## データ構造
Event Sourcing パターンを使用:
- **users**: ユーザーマスタ
- **tags**: タグマスタ  
- **topic_events**: Topic関連イベント (created, updated, deleted, tag_added, tag_removed)
- **post_events**: Post関連イベント (created, updated, deleted)
- **topics_view**: Topicの現在状態 (読み込み用ビュー)
- **posts_view**: Postの現在状態 (読み込み用ビュー)
- **topic_tags_view**: Topic-Tag関連の現在状態

## プロジェクト構造
```
web_app/
├── app/                    # アプリケーションコード
│   ├── routes/            # ルーティング
│   ├── services/          # ビジネスロジック
│   ├── auth/              # 認証関連
│   └── components/        # UIコンポーネント
├── infra/                 # インフラ関連
│   └── db/d1/            # データベース設定・マイグレーション
├── model/                 # 型定義・スキーマ
└── workers/               # Cloudflare Workers エントリーポイント
```

## 開発フェーズ
- **Phase 1**: プロジェクト基盤構築 (ほぼ完了)
- **Phase 2**: コア機能実装 (進行中)
- **Phase 3**: 追加機能実装
- **Phase 4**: 最終調整・デプロイ

## 重要な制約
- サインアップ機能は実装しない（認証済みユーザーのみ）
- 投稿編集・削除は投稿者本人のみ可能
- **`any`型の使用を絶対に禁止**
- 全ての投稿内容はプレーンテキスト形式で保存
- スレッド構造は parent_post_id で実現