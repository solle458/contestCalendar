# 技術選定書 - 競技プログラミングコンテスト Googleカレンダー同期サービス

## 目的

本書は、「AtCoder、Codeforces、OMC などの競技プログラミングコンテストを Google カレンダーに自動登録する Web サービス」の技術スタックを選定するための指針を示します。スケーラビリティ、保守性、セキュリティ、開発効率を考慮して決定します。

---

## フロントエンド

| 項目 | 技術 | 理由 |
|------|------|------|
| フレームワーク | **Next.js（React + TypeScript）** | SSR/CSR両対応。Google認証との親和性が高く、Vercelとの連携も容易。 |
| 言語 | **TypeScript** | 型安全なコードにより保守性とバグ耐性が向上。 |
| UI ライブラリ | **Tailwind CSS** + **shadcn/ui** | デザイン効率と一貫性を確保しつつ、カスタマイズも容易。 |
| 認証 UI | **next-auth** | Google OAuth2.0 連携が容易。セッション管理も自動化されている。 |

---

## バックエンド

| 項目 | 技術 | 理由 |
|------|------|------|
| 実装方法 | **Next.js API Routes** または **Express (Node.js)** | Next.js で一体化可能。必要に応じて Express を外出し可能。 |
| 言語 | **TypeScript（Node.js）** | フロントと統一することで学習・保守コストを削減。 |
| Google連携 | **googleapis ライブラリ（Node.js）** | Google公式。認証からカレンダー操作まで対応。 |
| ジョブ管理 | **GitHub Actions**（初期） / **Cloud Scheduler**（拡張） | 定期的なコンテスト取得・同期処理に活用。無料枠で実行可能。 |

---

## データ取得処理（オンラインジャッジ）

| 対象サイト | 手法 | 備考 |
|-------------|------|------|
| Codeforces | **公式 API** | REST API 提供あり。定期的に呼び出してコンテスト情報を取得。 |
| AtCoder | **スクレイピング（cheerio / Puppeteer）** | API 非公開のため HTML 解析が必要。レート制限や変更に注意。 |
| OMC | **個別対応** | コンテスト情報取得方法を調査の上、実装方針を決定。 |

---

## データベース

| 項目 | 技術 | 理由 |
|------|------|------|
| サービス | **Supabase（PostgreSQL）** | オープンソースで拡張性が高く、Next.jsとの親和性も良好。 |
| ORM | **Prisma** | 型安全で柔軟なクエリ記述が可能。開発生産性向上に寄与。 |

---

## ホスティング・デプロイ

| 項目 | 技術 | 理由 |
|------|------|------|
| フロント & API | **Vercel** | Next.jsとシームレス。自動デプロイやPreview Deploy対応。 |
| バックエンド外出し（任意） | **Render / Railway** | Express等のNode.jsサーバを独立運用する場合に使用。 |
| ジョブ実行 | **GitHub Actions** | 定期実行やデータ同期処理に対応。無料で簡単に開始可能。 |

---

## CI / CD

| 項目 | 技術 | 理由 |
|------|------|------|
| 継続的インテグレーション | **GitHub Actions** | コミットごとのテスト・ビルド・デプロイを自動化。 |
| バージョン管理 | **Git + GitHub** | チーム開発や公開にも対応。 |

---

## 開発支援ツール

| 項目 | 技術 | 理由 |
|------|------|------|
| エラーログ管理 | **Vercel Logging / Sentry（将来拡張）** | 本番環境の監視・トラブル対応に有効。 |
| モノレポ対応（任意） | **Turborepo** | フロントエンドとバックエンドを一元管理可能。 |
| フォーマット | **ESLint + Prettier** | コードスタイルの統一。 |

---

## 今後の拡張性を考慮した候補

- **通知Bot連携（Discord / LINE）**
- **他OJ対応（TopCoder, LeetCode, yukicoder など）**
- **ICSファイルの生成・配布**
- **PWA対応によるモバイル最適化**

---

## MVP向け 技術構成まとめ

| 項目 | 技術 |
|------|------|
| フロント | Next.js（TypeScript）+ TailwindCSS + next-auth |
| バックエンド | Next.js API Routes（Node.js）または Express |
| データベース | Supabase（PostgreSQL）+ Prisma |
| Google連携 | googleapis（OAuth 2.0 + Calendar API） |
| ジョブ処理 | GitHub Actions |
| ホスティング | Vercel |
| CI/CD | GitHub Actions |

---
