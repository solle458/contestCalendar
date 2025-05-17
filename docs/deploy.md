# 🚀 デプロイガイド - 競技プログラミングコンテストカレンダー同期サービス

本ドキュメントでは、競技プログラミングコンテストカレンダー同期サービスのデプロイ方法について詳細に解説します。このプロジェクトは、フロントエンド（Next.js）とバックエンド（FastAPI）の2つの主要コンポーネントで構成されており、それぞれ異なる環境にデプロイします。

---

## 📋 デプロイ概要

| コンポーネント | デプロイ先 | 技術 |
|--------------|-----------|------|
| フロントエンド | Vercel    | Next.js 14 (App Router) |
| バックエンド   | クラウドサービス | FastAPI + Docker |
| データベース   | マネージドDBサービス | PostgreSQL |
| CI/CD        | GitHub Actions | 自動テスト・ビルド・デプロイ |

---

## 🔧 事前準備

### 1. 必要なアカウント・サービス

- **GitHub アカウント**：ソースコード管理とCI/CD
- **Vercel アカウント**：フロントエンドのホスティング
- **クラウドサービス**：AWS、GCP、Azureなどのいずれか
- **Google Cloud Platform アカウント**：Google OAuth認証とGoogle Calendar APIの利用

### 2. 環境変数の準備

#### フロントエンド（Next.js）環境変数

```
# .env.local（開発環境）/ Vercel環境変数（本番環境）
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXTAUTH_URL=https://your-app-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### バックエンド（FastAPI）環境変数

```
# .env（開発環境）/ 環境変数（本番環境）
DATABASE_URL=postgresql://user:password@db-host:5432/dbname
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://your-app-domain.com
```

---

## 🖥️ フロントエンドのデプロイ（Vercel）

### 1. Vercelへのデプロイ手順

1. Vercelアカウントにログイン
2. 「New Project」をクリック
3. GitHubリポジトリをインポート
4. 以下の設定を行う：
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `.next`

### 2. 環境変数の設定

1. Vercelプロジェクト設定の「Environment Variables」セクションで上記の環境変数を設定
2. 必要に応じてProduction/Preview/Developmentごとに異なる値を設定

### 3. ドメイン設定

1. Vercelの「Domains」セクションでカスタムドメインを設定（任意）
2. DNSレコードを設定してドメインを検証

---

## 🐳 バックエンドのデプロイ（Docker + クラウドサービス）

### 1. Dockerイメージのビルドとプッシュ

```bash
# イメージのビルド
cd backend
docker build -t contestcalendar-api:latest .

# コンテナレジストリへのプッシュ（例：Docker Hub）
docker tag contestcalendar-api:latest username/contestcalendar-api:latest
docker push username/contestcalendar-api:latest
```

### 2. クラウドサービスへのデプロイ

#### AWS Elastic Beanstalk の場合

1. Elastic Beanstalkコンソールで新しいアプリケーションを作成
2. プラットフォームに「Docker」を選択
3. `Dockerrun.aws.json` ファイルをアップロード（以下は例）：

```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "username/contestcalendar-api:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "8000",
      "HostPort": "80"
    }
  ],
  "Volumes": [],
  "Logging": "/var/log/app"
}
```

#### Google Cloud Run の場合

```bash
# Google Cloud Run へのデプロイ
gcloud run deploy contestcalendar-api \
  --image username/contestcalendar-api:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=postgresql://user:password@/dbname?host=/cloudsql/instance-connection-name"
```

---

## 🗃️ データベースのセットアップ

### 1. マネージドデータベースサービスの作成

#### AWS RDS (PostgreSQL) の場合

1. AWS RDSコンソールで新しいPostgreSQLインスタンスを作成
2. セキュリティグループを設定し、バックエンドサービスからのアクセスを許可
3. データベース名、ユーザー名、パスワードを設定

#### Google Cloud SQL (PostgreSQL) の場合

```bash
# Cloud SQLインスタンスの作成
gcloud sql instances create contestcalendar-db \
  --database-version=POSTGRES_13 \
  --tier=db-f1-micro \
  --region=asia-northeast1 \
  --root-password=your-root-password

# データベースの作成
gcloud sql databases create contestcalendar \
  --instance=contestcalendar-db
```

### 2. データベースマイグレーション

```bash
# 初期マイグレーションの実行
cd backend
export DATABASE_URL=postgresql://user:password@db-host:5432/dbname
alembic upgrade head
```

---

## 🔄 CI/CD パイプラインの設定（GitHub Actions）

### 1. GitHub Actionsワークフローの作成

`.github/workflows/deploy.yml` ファイルを作成：

```yaml
name: Deploy Contest Calendar

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install backend dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest
          
      - name: Run backend tests
        run: |
          cd backend
          pytest
          
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm install
          
      - name: Run frontend tests
        run: |
          cd frontend
          npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
        
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
          
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/contestcalendar-api:latest
          
      # クラウドサービスへのデプロイ（例：Google Cloud Run）
      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v1
        with:
          service: contestcalendar-api
          image: ${{ secrets.DOCKERHUB_USERNAME }}/contestcalendar-api:latest
          region: asia-northeast1
          credentials: ${{ secrets.GCP_SA_KEY }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Vercelへのデプロイ
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

### 2. GitHub Secretsの設定

GitHub リポジトリの Settings > Secrets and variables > Actions で以下のシークレットを設定：

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `GCP_SA_KEY`（または他のクラウドサービスの認証情報）
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

## 📡 デプロイ後の設定

### 1. Google OAuth設定

1. Google Cloud Consoleで認証済みリダイレクトURIを更新：
   - `https://your-app-domain.com/api/auth/callback/google`

### 2. CORS設定

1. バックエンドのCORS設定でフロントエンドのドメインを許可：

```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. 定期実行ジョブの設定

#### クラウドスケジューラの場合（Google Cloud）

```bash
# Cloud Schedulerジョブの作成（コンテスト情報取得用）
gcloud scheduler jobs create http fetch-contests \
  --schedule="0 */6 * * *" \
  --uri="https://api.example.com/api/cron/fetch-contests" \
  --http-method=POST \
  --headers="Authorization=Bearer ${CRON_SECRET_KEY}"
```

---

## 🔍 監視とログ

### 1. ロギングの設定

- バックエンドのログはクラウドサービスのロギングシステムに統合
- フロントエンドのエラーログはVercelのダッシュボードで確認

### 2. アラートの設定

- エラー率が閾値を超えた場合のアラート設定
- 定期実行ジョブの失敗時のアラート設定

---

## 🔄 更新とロールバック

### 1. 更新手順

- GitHubのmainブランチへのプッシュで自動デプロイ
- 重要な更新は事前にステージング環境でテスト

### 2. ロールバック手順

- Vercel：デプロイ履歴から以前のデプロイを選択して「Redeploy」
- バックエンド：以前のDockerイメージタグを指定して再デプロイ

---

## 📝 まとめ

このデプロイガイドでは、競技プログラミングコンテストカレンダー同期サービスの各コンポーネントのデプロイ方法を解説しました。フロントエンドはVercel、バックエンドはDockerコンテナ化してクラウドサービスにデプロイ、データベースはマネージドサービスを利用することで、スケーラブルで保守性の高いシステム構成を実現しています。

GitHub Actionsを活用したCI/CDパイプラインにより、コードの品質を保ちながら継続的なデプロイを自動化しています。

--- 
