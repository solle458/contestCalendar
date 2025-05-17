# 🗃️ データベーステーブル設計書（PostgreSQL + SQLAlchemy）

本ドキュメントは、競技プログラミングコンテストカレンダー同期サービスにおけるDBテーブル構成を定義します。バックエンドは SQLAlchemy ORM を使用しています。

---

## 1. 📄 users（ユーザー情報）

| カラム名       | 型              | 説明 |
|----------------|------------------|------|
| id             | UUID (PK)        | ユーザーID（内部用） |
| google_id      | TEXT (Unique)    | GoogleアカウントのサブID |
| email          | TEXT             | メールアドレス |
| name           | TEXT             | 表示名 |
| created_at     | TIMESTAMP        | 登録日時 |
| updated_at     | TIMESTAMP        | 最終更新日時 |

---

## 2. ⚙️ settings（ユーザーの同期設定）

| カラム名               | 型              | 説明 |
|------------------------|------------------|------|
| id                     | INTEGER (PK)     | 設定ID |
| user_id                | UUID (FK)        | `users.id` への外部キー |
| platform               | TEXT             | OJの種類（`atcoder` / `codeforces` / `omc` 等） |
| notify_before_min      | INTEGER          | 通知タイミング（分） |
| enabled                | BOOLEAN          | このOJを同期対象に含めるか |
| created_at             | TIMESTAMP        | 作成日時 |
| updated_at             | TIMESTAMP        | 更新日時 |

---

## 3. 🔐 tokens（Google OAuth トークン）

| カラム名       | 型            | 説明 |
|----------------|----------------|------|
| id             | INTEGER (PK)   | トークンID |
| user_id        | UUID (FK)      | `users.id` |
| access_token   | TEXT           | 現在のアクセストークン |
| refresh_token  | TEXT           | 更新用リフレッシュトークン |
| id_token       | TEXT           | ID トークン |
| expires_at     | TIMESTAMP      | アクセストークンの有効期限 |
| created_at     | TIMESTAMP      | 登録日時 |
| updated_at     | TIMESTAMP      | 更新日時 |

---

## 4. 🕑 sync_history（同期履歴）

| カラム名       | 型            | 説明 |
|----------------|----------------|------|
| id             | INTEGER (PK)   | 履歴ID |
| user_id        | UUID (FK)      | `users.id` |
| contest_id     | TEXT           | 同期したコンテストのID |
| platform       | TEXT           | コンテストの提供元（例: `atcoder`） |
| synced_at      | TIMESTAMP      | 同期実行日時 |

---

## 5. 🏁 contests（取得したコンテスト一覧）

| カラム名       | 型            | 説明 |
|----------------|----------------|------|
| id             | TEXT (PK)      | コンテストID（例: abc350） |
| platform       | TEXT           | OJ（例: atcoder, codeforces） |
| title          | TEXT           | コンテスト名 |
| start_time     | TIMESTAMP      | 開始時間 |
| duration_min   | INTEGER        | 所要時間（分） |
| url            | TEXT           | コンテストページURL |
| created_at     | TIMESTAMP      | 登録日時 |

---

## 🔗 外部キー関係図（簡易）

```
users
└──< settings
└──< tokens
└──< sync_history
```

---

## 🔄 SQLAlchemyモデル例（簡略）

```python
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    google_id = Column(String, unique=True)
    email = Column(String)
    name = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Setting(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    platform = Column(String)
    notify_before_min = Column(Integer)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Token(Base):
    __tablename__ = "tokens"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    access_token = Column(Text)
    refresh_token = Column(Text)
    id_token = Column(Text)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class SyncHistory(Base):
    __tablename__ = "sync_history"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    contest_id = Column(String)
    platform = Column(String)
    synced_at = Column(DateTime, server_default=func.now())

class Contest(Base):
    __tablename__ = "contests"
    
    id = Column(String, primary_key=True)
    platform = Column(String)
    title = Column(String)
    start_time = Column(DateTime)
    duration_min = Column(Integer)
    url = Column(String)
    created_at = Column(DateTime, server_default=func.now())
```

---
