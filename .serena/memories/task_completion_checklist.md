# タスク完了時のチェックリスト

## 必須実行項目

### 1. 型チェック実行
```bash
cd web_app
npm run typecheck
```
- TypeScript エラーが0件であることを確認
- Cloudflare型定義が正しく生成されることを確認

### 2. テスト実行
```bash
cd web_app
npm run test
```
- 全テストがパスすることを確認
- 新機能には必ずテストが含まれていることを確認

### 3. TDDサイクルの確認
- [ ] Red: 失敗するテストを最初に書いた
- [ ] Green: テストをパスする最小実装を行った
- [ ] Refactor: コードをリファクタリングした

## コード品質確認

### 型安全性チェック
- [ ] `any`型を使用していない
- [ ] Union型や`unknown`型を適切に使用
- [ ] 既存の型定義（`model/topic.ts`, `model/user.ts`）を活用
- [ ] Valibotスキーマでバリデーション実装

### アーキテクチャ準拠
- [ ] Event Sourcingパターンに従っている
- [ ] サーバーサイドコードは`.server.ts`拡張子
- [ ] 適切なディレクトリ構造に配置

## 統合確認

### 開発サーバーでの動作確認
```bash
cd web_app
npm run dev
```
- ブラウザで正常に表示されることを確認
- 実装した機能が期待通りに動作することを確認

### ビルド確認
```bash
cd web_app
npm run build
```
- ビルドエラーが発生しないことを確認

## 自動実行される項目 (Claude Code Hooks)

以下は編集時に自動実行されるため、手動実行不要:
- `npm run typecheck` (Edit/Write時)

## フェーズ完了時の追加項目

### Phase完了時
- [ ] TODO.mdの進捗更新
- [ ] ユーザーレビュー依頼
- [ ] 次Phase準備

### 最終デプロイ前
```bash
cd web_app
npm run deploy
```
- Cloudflare Workersへの正常デプロイ確認