---

```markdown
# 📁 ディレクトリ構成 - 競技プログラミングカレンダー同期サービス

本ドキュメントでは、フロントエンド（Next.js + TypeScript）とバックエンド（Express + TypeScript + Prisma）を統合したプロジェクトのディレクトリ構成を示します。

---

## 🗂️ ルート構成

```

project-root/
├── frontend/                   # フロントエンドアプリ（Next.js）
├── backend/                    # バックエンドAPI（Express + TypeScript + Prisma）
├── .gitignore
├── README.md
└── package.json                # ルート共通スクリプト管理（オプション）

```

---

## 🧩 frontend/ (Next.js + TypeScript)

```

frontend/
├── app/ or pages/              # ルーティングディレクトリ（App Router or Pages Router）
│   ├── login/                  # ログイン画面
│   ├── dashboard/              # ユーザーのダッシュボード
│   ├── settings/               # 同期設定画面
│   └── api/                    # （必要に応じて）Next.js API Routes
├── components/                 # 再利用可能なUIコンポーネント
├── hooks/                      # Reactカスタムフック（useAuthなど）
├── lib/                        # クライアント側ロジック・ユーティリティ
├── styles/                     # CSS / Tailwind / Sass などのスタイル群
├── types/                      # 型定義
├── public/                     # 静的ファイル
├── next.config.js              # Next.js設定
├── tsconfig.json
└── package.json

```

---

## 🧩 backend/ (Express + TypeScript + Prisma)

```

backend/
├── src/
│   ├── controllers/            # APIルートに対応するロジック
│   ├── services/               # ビジネスロジック（Google API, Contest処理など）
│   ├── routes/                 # Expressのルーティング定義
│   ├── middlewares/           # 認証、バリデーション、エラー処理など
│   ├── prisma/
│   │   └── schema.prisma       # Prismaのスキーマ定義
│   ├── utils/                  # 共通ユーティリティ関数
│   ├── types/                  # 型定義、DTOなど
│   ├── config/                 # 環境変数、OAuth設定など
│   ├── jobs/                   # 定期ジョブ（fetchContests, syncCalendars）
│   ├── app.ts                  # Expressアプリ設定（ミドルウェア, ルート登録）
│   └── index.ts                # サーバー起動エントリーポイント
├── .env                        # DB・OAuthなどの環境変数
├── tsconfig.json
├── package.json
└── prisma/                     # Prismaのマイグレーションやクライアント出力用

```

---

## 🔄 その他

```

.github/
├── workflows/
│   └── sync.yml                # GitHub Actions で定期実行するバッチ定義

```

---

## ✅ 注意点と運用ルール

- **フロントエンドとバックエンドは完全に分離**しており、それぞれが独立してビルド・デプロイ可能です。
- API URL は `.env.local` などで切り替え可能にしておきます（例：`NEXT_PUBLIC_API_BASE_URL`）。
- Prisma CLI は `backend/` ディレクトリから実行。
- 開発時はそれぞれ `npm run dev` 等で起動し、フロントエンドからバックエンドを叩く構成とします。

---

```

必要であれば、この構成に基づいた `package.json` や起動スクリプト、Prisma CLIのセットアップ、CI/CD構成もご支援できます。必要な部分をお知らせください。
