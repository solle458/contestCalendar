# 🗃️ データベーステーブル設計書（PostgreSQL + Prisma ORM）

本ドキュメントは、競技プログラミングカレンダー同期サービスにおけるDBテーブル構成を定義します。バックエンドは Prisma ORM を想定しています。

---

## 1. 📄 users（ユーザー情報）

| カラム名       | 型              | 説明 |
|----------------|------------------|------|
| id             | UUID (PK)        | ユーザーID（内部用） |
| google_id      | TEXT (Unique)    | GoogleアカウントのサブID |
| email          | TEXT             | メールアドレス |
| name           | TEXT             | 表示名（任意） |
| created_at     | TIMESTAMP        | 登録日時 |
| updated_at     | TIMESTAMP        | 最終更新日時 |

---

## 2. ⚙️ settings（ユーザーの同期設定）

| カラム名               | 型              | 説明 |
|------------------------|------------------|------|
| id                     | UUID (PK)        | 設定ID |
| user_id                | UUID (FK)        | `users.id` への外部キー |
| platform               | TEXT             | OJの種類（`atcoder` / `codeforces` / `omc` 等） |
| notify_before_minutes  | INTEGER          | 通知タイミング（分） |
| active                 | BOOLEAN           | このOJを同期対象に含めるか |
| created_at             | TIMESTAMP        | 作成日時 |
| updated_at             | TIMESTAMP        | 更新日時 |

---

## 3. 🔐 tokens（Google OAuth トークン）

| カラム名       | 型            | 説明 |
|----------------|----------------|------|
| id             | UUID (PK)      | トークンID |
| user_id        | UUID (FK)      | `users.id` |
| access_token   | TEXT           | 現在のアクセストークン |
| refresh_token  | TEXT           | 更新用リフレッシュトークン |
| expires_at     | TIMESTAMP      | アクセストークンの有効期限 |
| scope          | TEXT           | 取得スコープ（オプション） |
| token_type     | TEXT           | Bearer等 |
| created_at     | TIMESTAMP      | 登録日時 |
| updated_at     | TIMESTAMP      | 更新日時 |

---

## 4. 🕑 sync_history（同期履歴）

| カラム名       | 型            | 説明 |
|----------------|----------------|------|
| id             | UUID (PK)      | 履歴ID |
| user_id        | UUID (FK)      | `users.id` |
| contest_id     | TEXT           | 同期したコンテストのID（ユニーク） |
| platform       | TEXT           | コンテストの提供元（例: `atcoder`） |
| synced_at      | TIMESTAMP      | 同期実行日時 |

---

## 5. 🏁 contests（取得したコンテスト一覧）※任意でキャッシュ用

| カラム名       | 型            | 説明 |
|----------------|----------------|------|
| id             | TEXT (PK)      | コンテストID（例: abc350） |
| platform       | TEXT           | OJ（例: atcoder, codeforces） |
| title          | TEXT           | コンテスト名 |
| start_time     | TIMESTAMP      | 開始時間 |
| duration_min   | INTEGER        | 所要時間（分） |
| url            | TEXT           | コンテストページURL |
| created_at     | TIMESTAMP      | 登録日時 |

> `sync_history`と合わせて「既に同期されたコンテストか」を判定可能。

---

## 🔗 外部キー関係図（簡易）

```

users
└──< settings
└──< tokens
└──< sync\_history

sync\_history
└──> contests（contest\_id + platform）

````

---

## 🔄 Prismaリレーション例（簡略）

```ts
model User {
  id         String    @id @default(uuid())
  googleId   String    @unique
  email      String
  name       String?
  settings   Setting[]
  tokens     Token[]
  syncs      SyncHistory[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model Setting {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  platform  String
  notifyBeforeMinutes Int
  active    Boolean
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Token {
  id            String   @id @default(uuid())
  user          User     @relation(fields: [userId], references: [id])
  userId        String
  accessToken   String
  refreshToken  String
  expiresAt     DateTime
  scope         String?
  tokenType     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model SyncHistory {
  id         String   @id @default(uuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  contestId  String
  platform   String
  syncedAt   DateTime @default(now())
}

model Contest {
  id          String   @id
  platform    String
  title       String
  startTime   DateTime
  durationMin Int
  url         String
  createdAt   DateTime @default(now())
}
````

---
