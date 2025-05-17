# Contest Calendar

競技プログラミングコンテストのカレンダーアプリケーション<br>
このプロジェクトは話題のVibe Codingの威力がどれほど凄いのかを自分で検証するためのものです。実際に自分でCodingした部分は殆どありません。デプロイについては考えましたが、クラウドサービスへ課金するのが嫌だったため諦めました。

## 概要

AtCoder、Codeforces、OMCなどの競技プログラミングコンテストの予定を自動でGoogleカレンダーに同期するWebアプリケーションです。複数のオンラインジャッジ（OJ）のコンテスト情報を一元管理し、効率的なスケジュール管理を実現します。

## 技術スタック

### フロントエンド
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- NextAuth.js (認証)

### バックエンド
- FastAPI
- Python 3.11+
- SQLAlchemy
- Alembic (マイグレーション)
- Pydantic

### データベース
- PostgreSQL

## 機能

- Google OAuth認証によるログイン
- 複数の競技プログラミングサイトのコンテスト情報取得
- Googleカレンダーへの自動同期
- コンテスト通知設定のカスタマイズ
- 手動同期の実行

## 開発環境のセットアップ

### 必要条件
- Docker
- Docker Compose
- Node.js 18+
- Python 3.11+

### セットアップ手順

1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/contestCalendar.git
cd contestCalendar
```

2. バックエンドのセットアップ
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. フロントエンドのセットアップ
```bash
cd frontend
npm install
```

4. 環境変数の設定
```bash
# backend/.env
cp backend/.env.example backend/.env
# 必要に応じて環境変数を編集
```

5. 開発サーバーの起動
```bash
# バックエンドとデータベースの起動
docker compose up -d

# バックエンドの起動
cd backend
uvicorn app.main:app --reload --port 8001

# フロントエンドの起動
cd frontend
npm run dev
```

## 開発

- バックエンド: http://localhost:8001
- フロントエンド: http://localhost:3000
- API ドキュメント: http://localhost:8001/docs

## ドキュメント

詳細なドキュメントは `docs/` ディレクトリに格納されています。

- [要件定義](docs/requirementsDefinition.md)
- [アーキテクチャ](docs/architecture.md)
- [API仕様](docs/api.md)
- [データベーススキーマ](docs/schema.md)
- [ディレクトリ構成](docs/directory.md)
- [技術選定](docs/technologySelection.md)

## ライセンス

MIT
