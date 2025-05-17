# 📘 API仕様書 - 競技プログラミングコンテストカレンダー同期サービス

本ドキュメントは、フロントエンド（Next.js）とバックエンド（FastAPI）間の通信に使用されるREST APIを定義します。

## 🔐 認証と共通仕様

- 全APIはHTTPSで保護される
- 認証方式：**JWTベースのBearerトークン**
- 認可ヘッダ例：

```
Authorization: Bearer <JWT_TOKEN>
```

- すべてのレスポンスは `application/json`

---

## 1. コンテスト API

### 🏁 `GET /api/contests`

指定されたプラットフォームの今後のコンテスト一覧を取得

* **クエリパラメータ（任意）**

  * `platform`: `atcoder` / `codeforces` / `omc`

* **認証**：必要

* **レスポンス**

```json
[
  {
    "id": "abc350",
    "platform": "atcoder",
    "title": "AtCoder Beginner Contest 350",
    "start_time": "2025-05-24T12:00:00Z",
    "duration_min": 100,
    "url": "https://atcoder.jp/contests/abc350"
  }
]
```

---

## 2. 設定 API

### ⚙️ `GET /api/settings`

ユーザーのコンテスト同期設定一覧を取得

* **認証**：必要

* **レスポンス**

```json
[
  {
    "id": 1,
    "platform": "atcoder",
    "notify_before_min": 30,
    "enabled": true
  },
  {
    "id": 2,
    "platform": "codeforces",
    "notify_before_min": 60,
    "enabled": false
  }
]
```

---

### 🛠️ `PUT /api/settings`

ユーザーの設定を更新する

* **認証**：必要
* **リクエスト**

```json
{
  "id": 1,
  "platform": "atcoder",
  "notify_before_min": 15,
  "enabled": true
}
```

* **レスポンス**

```json
{
  "id": 1,
  "platform": "atcoder",
  "notify_before_min": 15,
  "enabled": true
}
```

---

## 3. 同期 API

### 🔄 `POST /api/sync/calendar`

即時同期を実行。設定されたOJの今後のコンテストを取得し、Googleカレンダーに予定を登録。

* **認証**：必要

* **リクエストボディ**：

```json
{
  "refresh_token": "...",
  "id_token": "..."
}
```

* **レスポンス**

```json
{
  "success": true,
  "message": "3件のコンテストをカレンダーに同期しました",
  "synced_contests": 3
}
```

---

## 4. エラーレスポンス仕様

共通のエラーフォーマットを使用：

```json
{
  "detail": "エラーメッセージ"
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

## 5. 今後の拡張候補API

| エンドポイント                        | 説明                                |
| ------------------------------ | --------------------------------- |
| `/api/export/ics`              | ICS形式のカレンダーファイルを生成（非Googleユーザー向け） |
| `/api/notifications/subscribe` | DiscordやSlack連携                   |

---
