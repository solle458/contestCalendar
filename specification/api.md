# 📘 API仕様書 - Googleカレンダー同期サービス

本ドキュメントは、フロントエンド（Next.js）とバックエンド（Express + TypeScript）間の通信に使用されるREST APIを定義します。

## 🔐 認証と共通仕様

- 全APIはHTTPSで保護される
- 認証方式：**JWTベースのBearerトークン**
- 認可ヘッダ例：

Authorization: Bearer \<JWT\_TOKEN>

- すべてのレスポンスは `application/json`

---

## 1. 認証関連 API

### 🔁 `POST /api/auth/google`

Google OAuth2 認証を開始する。

- **リクエスト**
- Body: なし
- Google OAuth のURLにリダイレクトされる

- **レスポンス**
- リダイレクトのためレスポンスなし

---

### ✅ `GET /api/auth/callback?code=...`

GoogleのOAuth認証完了後のリダイレクトエンドポイント

- **処理**
- `code` を受け取りアクセストークン／リフレッシュトークンを取得
- DBに保存し、JWTを発行して返却

- **レスポンス**
```json
{
"token": "<JWT>",
"user": {
  "id": "...",
  "email": "...",
  "name": "..."
}
}
````

---

## 2. ユーザー API

### 👤 `GET /api/user/me`

現在ログイン中のユーザー情報を取得

* **認証**：必要

* **レスポンス**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "User Name"
}
```

---

### ⚙️ `GET /api/user/settings`

ユーザーのコンテスト同期設定一覧を取得

* **認証**：必要

* **レスポンス**

```json
[
  {
    "platform": "atcoder",
    "notifyBeforeMinutes": 30,
    "active": true
  },
  {
    "platform": "codeforces",
    "notifyBeforeMinutes": 60,
    "active": false
  }
]
```

---

### 🛠️ `POST /api/user/settings`

ユーザーの設定を新規作成または更新する

* **認証**：必要
* **リクエスト**

```json
{
  "platform": "atcoder",
  "notifyBeforeMinutes": 15,
  "active": true
}
```

* **レスポンス**

```json
{
  "message": "Settings updated"
}
```

---

## 3. コンテスト API

### 🏁 `GET /api/contests`

指定されたプラットフォームの今後のコンテスト一覧を取得

* **クエリパラメータ（任意）**

  * `platform`: `atcoder` / `codeforces` / `omc`

* **認証**：不要（パブリックでも可）

* **レスポンス**

```json
[
  {
    "id": "abc350",
    "platform": "atcoder",
    "title": "AtCoder Beginner Contest 350",
    "startTime": "2025-05-24T12:00:00Z",
    "durationMin": 100,
    "url": "https://atcoder.jp/contests/abc350"
  }
]
```

---

## 4. 同期 API

### 🔄 `POST /api/sync/calendar`

即時同期を実行。設定されたOJの今後のコンテストを取得し、Googleカレンダーに予定を登録。

* **認証**：必要

* **リクエストボディ**：なし（設定はDBに登録済のものを使用）

* **レスポンス**

```json
{
  "synced": [
    "abc350",
    "cf1234"
  ],
  "skipped": [
    "abc349" // 既に同期済み
  ]
}
```

---

## 5. 管理者API（オプション）

### 👮 `GET /api/admin/users`

ユーザー一覧の取得（管理者用）

* **認証**：必要（管理者トークン）

---

## 6. エラーレスポンス仕様

共通のエラーフォーマットを使用：

```json
{
  "error": {
    "code": 401,
    "message": "Unauthorized"
  }
}
```

| ステータスコード | 意味                    |
| -------- | --------------------- |
| 400      | Bad Request（不正な入力）    |
| 401      | Unauthorized（認証エラー）   |
| 403      | Forbidden（権限なし）       |
| 404      | Not Found（対象なし）       |
| 500      | Internal Server Error |

---

## 🔚 今後の拡張候補API

| エンドポイント                        | 説明                                |
| ------------------------------ | --------------------------------- |
| `/api/export/ics`              | ICS形式のカレンダーファイルを生成（非Googleユーザー向け） |
| `/api/notifications/subscribe` | DiscordやSlack連携                   |

---
