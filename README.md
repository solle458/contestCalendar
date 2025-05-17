# Contest Calendar

競技プログラミングコンテストのカレンダーアプリケーション

## 技術スタック

### フロントエンド
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- Zod

### バックエンド
- FastAPI
- Python 3.11+
- SQLAlchemy
- Alembic
- Pydantic

### データベース
- PostgreSQL

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

# フロントエンドの起動
cd frontend
npm run dev
```

## 開発

- バックエンド: http://localhost:8000
- フロントエンド: http://localhost:3000
- API ドキュメント: http://localhost:8000/docs

## ライセンス

MIT
