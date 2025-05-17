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

| Backend API (Express + TypeScript) |
| ---------------------------------- |
| - 認証チェック（JWT / セッション）              |
| - Google Calendar API 連携処理         |
| - ユーザー設定の CRUD                     |
| - カレンダー同期ロジック                      |
| +-----------+---------------+      |


        |
        v


+---------------------------+

| Database (Supabase / PostgreSQL)    |
| ----------------------------------- |
| - users               (ユーザー基本情報)    |
| - settings            (同期対象や通知設定)   |
| - tokens              (OAuthトークン情報) |
| - sync\_history        (同期履歴)       |
| +---------------------------+       |


        ↑
        |
        |  定期ジョブ（GitHub Actions / Cloud Scheduler）
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

- 認証: Google OAuth (next-auth)
- API 通信: fetch or axios → Express API 呼び出し（JWT付き）
- 主なページ:
  - `/login`: ログイン画面
  - `/dashboard`: 登録情報一覧
  - `/settings`: OJごとの同期設定

---

### 2. バックエンド (Express + TypeScript)

#### 2.1 技術スタック

| 技術 | 用途 |
|------|------|
| Express.js | HTTP API サーバー |
| TypeScript | 型安全な開発 |
| googleapis | Google Calendar 連携 |
| Prisma | DB ORM |
| jsonwebtoken | JWTによる認証管理 |
| dotenv | 環境変数管理 |
| express-session（オプション） | セッション管理（JWT代替） |

#### 2.2 主なエンドポイント（例）

| メソッド | エンドポイント | 説明 |
|---------|----------------|------|
| POST    | /api/auth/google | Google OAuth 認証開始 |
| GET     | /api/user/me     | ログイン中のユーザー情報取得 |
| POST    | /api/user/settings | 同期設定の保存 |
| GET     | /api/contests     | 今後のコンテスト一覧取得 |
| POST    | /api/sync/calendar | 即時同期実行 |

---

### 3. データベース (PostgreSQL via Supabase)

#### テーブル設計（概要）

| テーブル名 | カラム | 説明 |
|------------|--------|------|
| users | id, google_id, email, name | Googleアカウントのユーザー情報 |
| settings | user_id, platform, notify_before_minutes, active | 同期対象設定 |
| tokens | user_id, access_token, refresh_token, expires_at | Google OAuthトークン |
| sync_history | user_id, contest_id, synced_at | 同期履歴ログ |

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

#### 実行場所

- GitHub Actions（MVP段階）
- 将来的に Cloud Functions / Cloud Scheduler + PubSub に移行可能

#### 構成ファイル

```

/scripts/fetchContests.ts
/scripts/syncCalendars.ts
/.github/workflows/sync.yml

```

#### 処理内容

- Codeforces API or AtCoder スクレイピングで最新コンテスト一覧取得
- 全ユーザーに対し同期設定を確認
- 必要に応じて Google Calendar に予定作成（重複排除）

---

## 🔐 セキュリティ設計

- Google OAuth2 によるログイン
- JWT 署名付きトークンによる API 認可
- アクセストークンは暗号化保存（必要に応じて）
- CSRF/XSS 対策は Next.js 側で対応
- APIへの不正アクセス検知・制限（将来的にWAFやRateLimit）

---

## 🚀 拡張計画（Optional）

| 機能 | 実装候補 |
|------|----------|
| 通知Bot | Discord / Slack / LINE |
| ICSファイル | 非Googleユーザー向けエクスポート |
| 管理者用画面 | 利用状況確認・強制同期 |
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
