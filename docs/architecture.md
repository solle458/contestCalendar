# アーキテクチャ設計書 - 競技プログラミングコンテスト Googleカレンダー同期サービス

## 🧭 概要

本ドキュメントは、AtCoder / Codeforces / OMC 等のコンテスト予定を Google カレンダーに自動登録するサービスのアーキテクチャを定義するものです。ユーザー認証、データ管理、スケジューリング、Google API連携など、全体構成を中心に設計指針を明示します。

---

## 📐 システム構成図（概要）

```
+---------------------------+
| Web Frontend (Next.js + TypeScript) |
| ----------------------------------- |
| - Google OAuth ログイン                 |
| - ユーザー設定 UI                         |
| - REST API 呼び出し（HTTPS）              |
| +-----------+---------------+       |


        |
        v


+---------------------------+
| Backend API (FastAPI + Python) |
| ---------------------------------- |
| - 認証チェック（JWT / セッション）              |
| - Google Calendar API 連携処理         |
| - ユーザー設定の CRUD                     |
| - カレンダー同期ロジック                      |
| +-----------+---------------+      |


        |
        v


+---------------------------+
| Database (PostgreSQL)    |
| ----------------------------------- |
| - users               (ユーザー基本情報)    |
| - settings            (同期対象や通知設定)   |
| - tokens              (OAuthトークン情報) |
| - sync\_history        (同期履歴)       |
| +---------------------------+       |


        ↑
        |
        |  定期ジョブ
        |


+---------------------------+
| cron: Contest Fetch + Google Calendar Sync |
| ------------------------------------------ |
| - Codeforces API                           |
| - AtCoder (スクレイピング)                        |
| - Google Calendar 予定登録                     |
| +---------------------------+              |
```

---

## 🧩 各コンポーネント詳細

### 1. フロントエンド (Next.js)

- **技術スタック**:
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS + shadcn/ui
  - NextAuth.js (認証)

- **主なページ**:
  - `/`: トップページ
  - `/auth/signin`: ログイン画面
  - `/dashboard`: コンテスト一覧とカレンダー同期
  - `/settings`: OJごとの同期設定

---

### 2. バックエンド (FastAPI)

#### 2.1 技術スタック

| 技術 | 用途 |
|------|------|
| FastAPI | HTTP API サーバー |
| Python 3.11+ | バックエンド言語 |
| SQLAlchemy | ORM |
| Alembic | データベースマイグレーション |
| Pydantic | データバリデーション |
| Google API Client | Google Calendar 連携 |

#### 2.2 主なエンドポイント

| メソッド | エンドポイント | 説明 |
|---------|----------------|------|
| GET     | /api/contests     | コンテスト一覧取得 |
| GET     | /api/settings     | ユーザー設定取得 |
| PUT     | /api/settings     | ユーザー設定更新 |
| POST    | /api/sync/calendar | カレンダー同期実行 |

---

### 3. データベース (PostgreSQL)

#### テーブル設計（概要）

| テーブル名 | 説明 |
|------------|------|
| users | ユーザー情報 |
| settings | 同期対象設定 |
| tokens | Google OAuthトークン |
| sync_history | 同期履歴ログ |
| contests | コンテスト情報キャッシュ |

---

### 4. Google API 連携

#### 認証スコープ

- `https://www.googleapis.com/auth/calendar`
- アクセストークンとリフレッシュトークンを取得し、DB に保存
- トークンが失効した場合はリフレッシュトークンで再取得

#### 操作フロー

1. 認証後、トークン保存
2. 対象ユーザーごとに設定を読み込み
3. 対象コンテストを取得し、Google カレンダーに予定作成
4. `sync_history` に記録

---

### 5. 定期実行バッチ処理

- コンテスト情報の定期取得
- ユーザー設定に基づくカレンダー同期
- Codeforces API やAtCoder スクレイピングによるデータ取得

---

## 🔐 セキュリティ設計

- Google OAuth2 によるログイン
- JWT 署名付きトークンによる API 認可
- アクセストークンは暗号化保存
- CSRF/XSS 対策
- レート制限によるAPI保護

---

## 🚀 拡張計画

| 機能 | 実装候補 |
|------|----------|
| 通知Bot | Discord / Slack / LINE |
| ICSファイル | 非Googleユーザー向けエクスポート |
| 複数カレンダー対応 | ユーザーに選択肢を提供 |
| OJ追加 | yukicoder / LeetCode など |

---

## ✅ 次のステップ

1. **ディレクトリ構成の設計（Express + Prisma）**
2. **ER図・スキーマ設計**
3. **Google OAuthのクライアント設定**
4. **API仕様書（OpenAPI or Markdown）**

---

```
