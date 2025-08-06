# 推奨コマンド

## 開発・テスト関連コマンド

### 開発サーバー
```bash
cd web_app
npm run dev
```

### テスト実行
```bash
cd web_app
npm run test           # 全テスト実行
vitest run             # 直接Vitestを実行
vitest --watch         # ウォッチモード（継続的テスト実行）
```

### 型チェック
```bash
cd web_app
npm run typecheck      # TypeScript型チェック + Cloudflare型生成
```

### ビルド・デプロイ
```bash
cd web_app
npm run build          # プロダクションビルド
npm run preview        # ビルド後のプレビュー
npm run deploy         # Cloudflare Workersにデプロイ
```

### データベース関連
```bash
cd web_app
npx drizzle-kit generate   # マイグレーションファイル生成
npx drizzle-kit migrate    # マイグレーション実行
npx drizzle-kit studio     # データベース管理UI
```

### Cloudflare関連
```bash
cd web_app
npm run cf-typegen     # Cloudflare型定義生成
wrangler types         # 直接型定義生成
wrangler dev           # ローカルでWorkers環境実行
```

## システムユーティリティコマンド (macOS/Darwin)

### ファイル・ディレクトリ操作
```bash
ls -la                 # ファイル一覧（詳細表示）
find . -name "*.ts"    # TypeScriptファイル検索
grep -r "pattern" .    # パターン検索
```

### Git操作
```bash
git status             # 変更状況確認
git add .              # 全変更をステージング
git commit -m "msg"    # コミット
git push origin main   # プッシュ
```

## 開発時の重要なワークフロー

### タスク完了時の必須実行コマンド
```bash
cd web_app
npm run typecheck      # 必須: 型チェック実行
npm run test           # 必須: テスト実行
```

### TDD開発サイクル
1. `vitest --watch` でテストをウォッチモードで実行
2. テスト実装 (Red)
3. 最小実装 (Green) 
4. リファクタリング (Refactor)
5. `npm run typecheck` で型安全性確認