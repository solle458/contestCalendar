# 📁 ディレクトリ構成 - 競技プログラミングコンテストカレンダー同期サービス

本ドキュメントでは、フロントエンド（Next.js + TypeScript）とバックエンド（FastAPI + Python）を統合したプロジェクトのディレクトリ構成を示します。

---

## 🗂️ ルート構成

```
project-root/
├── frontend/                   # フロントエンドアプリ（Next.js）
├── backend/                    # バックエンドAPI（FastAPI）
├── docs/                       # プロジェクトドキュメント
├── .gitignore
├── README.md
└── docker-compose.yml          # Docker Compose設定
```

---

## 🧩 frontend/ (Next.js + TypeScript)

```
frontend/
├── src/
│   ├── app/                    # App Routerによるルーティング
│   │   ├── (main)/             # メインレイアウト
│   │   ├── auth/               # 認証関連ページ
│   │   ├── dashboard/          # ダッシュボード
│   │   ├── settings/           # 設定画面
│   │   ├── api/                # Next.js API Routes
│   │   ├── layout.tsx          # ルートレイアウト
│   │   ├── page.tsx            # トップページ
│   │   └── globals.css         # グローバルスタイル
│   ├── components/             # 再利用可能なUIコンポーネント
│   │   ├── ui/                 # 汎用UIコンポーネント
│   │   └── layout/             # レイアウトコンポーネント
│   ├── lib/                    # クライアント側ロジック・ユーティリティ
│   │   ├── api-client.ts       # APIクライアント
│   │   ├── validation.ts       # バリデーションロジック
│   │   └── logger.ts           # ロギングユーティリティ
│   └── types/                  # 型定義
├── public/                     # 静的ファイル
├── next.config.ts              # Next.js設定
├── tsconfig.json               # TypeScript設定
├── package.json                # 依存関係
└── tailwind.config.js          # Tailwind CSS設定
```

---

## 🧩 backend/ (FastAPI + Python)

```
backend/
├── app/
│   ├── api/                    # APIエンドポイント
│   │   ├── contests.py         # コンテストAPI
│   │   ├── settings.py         # 設定API
│   │   └── sync.py             # 同期API
│   ├── core/                   # コア機能
│   │   ├── auth.py             # 認証
│   │   ├── config.py           # 設定
│   │   ├── logger.py           # ロギング
│   │   └── scheduler.py        # スケジューラ
│   ├── db/                     # データベース
│   │   ├── models.py           # SQLAlchemyモデル
│   │   ├── schemas.py          # Pydanticスキーマ
│   │   └── database.py         # DB接続
│   ├── services/               # ビジネスロジック
│   │   ├── calendar_sync.py    # カレンダー同期
│   │   ├── contest_fetcher.py  # コンテスト取得
│   │   └── contest_updater.py  # コンテスト更新
│   └── main.py                 # アプリケーションエントリポイント
├── alembic/                    # マイグレーション
├── alembic.ini                 # Alembic設定
├── requirements.txt            # 依存関係
└── Dockerfile                  # Docker設定
```

---

## 🔄 その他

```
docs/
├── api.md                      # API仕様書
├── architecture.md             # アーキテクチャ設計
├── directory.md                # ディレクトリ構成（本ドキュメント）
├── requirementsDefinition.md   # 要件定義
├── schema.md                   # データベーススキーマ
└── technologySelection.md      # 技術選定
```

---

## ✅ 注意点と運用ルール

- **フロントエンドとバックエンドは完全に分離**しており、それぞれが独立してビルド・デプロイ可能です。
- API URL は環境変数で切り替え可能にしておきます（例：`NEXT_PUBLIC_API_BASE_URL`）。
- Alembic CLI は `backend/` ディレクトリから実行。
- 開発時はそれぞれ `npm run dev` と `uvicorn app.main:app --reload` で起動し、フロントエンドからバックエンドを叩く構成とします。

---

