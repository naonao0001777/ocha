# PostgreSQL接続での prepare() 代替実装ガイド

## 問題の概要

PDOの `prepare()` メソッドが使用できない環境で、PostgreSQL接続を使用してプリペアドステートメントの代替を実装しました。

## 🚀 Docker環境での使用方法

### Docker環境（MySQL使用）
```bash
# 1. 元ファイルをバックアップ済み
# 2. MySQLConnection版を使用
cp app/routes/adminEdit_mysql.php app/routes/adminEdit.php
```

### 本番環境（PostgreSQL使用）
```bash
# PostgreSQLConnection版を使用（既に設定済み）
```

## 解決策

### 1. 環境別データベース接続クラス

#### PostgreSQL環境用: `PostgreSQLConnection`
```php
require_once('../database/PostgreSQLConnection.php');
$result = PostgreSQLConnection::queryParams($sql, [':userId' => $userId]);
```

#### MySQL環境用: `MySQLConnection`  
```php
require_once('../database/MySQLConnection.php');
$result = MySQLConnection::queryParams($sql, [':userId' => $userId]);
```

### 2. `queryParams()` - 基本的なパラメータ化クエリ

```php
// 旧: PDO prepare/execute
$stmt = $dbh->prepare($sql);
$stmt->bindvalue(':userId', $userId);
$stmt->execute();
$result = $stmt->fetch();

// 新: PostgreSQLConnection queryParams
$result = PostgreSQLConnection::queryParams($sql, [':userId' => $userId]);
$fetchedUser = PostgreSQLConnection::fetchAssoc($result);
```

#### `prepareAndExecute()` - 名前付きプリペアドステートメント

```php
// 繰り返し実行する場合に効率的
$result = PostgreSQLConnection::prepareAndExecute('get_user', $sql, [':userId' => $userId]);
```

### 3. 主要な変更点

#### データベース接続の変更

```php
// 旧
require_once('../database/connection.php');
$dbh = DatabaseConnection::Connection();

// 新: PostgreSQL環境
require_once('../database/PostgreSQLConnection.php');

// 新: MySQL環境
require_once('../database/MySQLConnection.php');
```

#### クエリ実行の変更

```php
// 旧: 選択クエリ
$stmt = $dbh->prepare($sql);
$stmt->bindvalue(':userId', $userId);
$stmt->execute();
$fetchedUser = $stmt->fetch();

// 新: 選択クエリ
$result = PostgreSQLConnection::queryParams($sql, [':userId' => $userId]);
$fetchedUser = PostgreSQLConnection::fetchAssoc($result);
```

```php
// 旧: 更新クエリ
$stmt = $dbh->prepare($sql);
$stmt->bindvalue(':userId', $userId);
$stmt->bindvalue(':titleData', $titleData);
$stmt->execute();

// 新: 更新クエリ
$result = PostgreSQLConnection::queryParams($sql, [
    ':userId' => $userId,
    ':titleData' => $titleData
]);
```

#### エラーハンドリングの変更

```php
// 旧
} catch (PDOException $e) {
    $msg = $e->getMessage();
}

// 新
if (!$result) {
    throw new Exception("操作に失敗しました: " . PostgreSQLConnection::getLastError());
}
```

### 3. 利用可能なメソッド

| メソッド | 説明 | 用途 |
|---------|------|------|
| `queryParams($sql, $params)` | パラメータ化クエリの実行 | 一般的なクエリ |
| `prepareAndExecute($name, $sql, $params)` | 名前付きプリペアド | 繰り返し実行 |
| `fetchAssoc($result)` | 1行を連想配列で取得 | SELECT結果の取得 |
| `fetchAllAssoc($result)` | 全行を連想配列で取得 | 複数行の取得 |
| `affectedRows($result)` | 影響を受けた行数 | UPDATE/DELETE確認 |
| `getLastError()` | 最後のエラーメッセージ | エラー処理 |
| `escapeBytea($data)` | バイナリデータのエスケープ | 画像データ等 |

### 4. 変更が必要なファイル

以下のファイルで `prepare()` を使用しているため、順次修正済みです：

- ✅ `routes/deleteAccount.php` (修正済み)
- ✅ `routes/adminEdit_postgres.php` (新規作成)
- ✅ `routes/route_postgres.php` (新規作成)
- ✅ `view/userInformation.php` (修正済み)
- ✅ `view/register.php` (修正済み)
- ✅ `view/login.php` (修正済み)
- ✅ `view/admin.php` (修正済み)
- ✅ `u/profile.php` (修正済み)

### 注意: 旧ファイルとの並行運用

安全のため、元のファイルはそのまま残し、新しいPostgreSQL対応ファイルを別名で作成しています：

- `adminEdit.php` → `adminEdit_postgres.php`
- `route.php` → `route_postgres.php`

動作確認後、必要に応じて置き換えることができます。

### 5. 段階的移行手順

1. **新しいファイルでテスト**: `adminEdit_postgres.php` で動作確認
2. **段階的置き換え**: 動作確認後、既存ファイルを順次更新
3. **テスト**: 各機能の動作確認

### 6. 注意事項

- パラメータは連想配列で渡す（`[':param' => $value]`）
- 戻り値はPostgreSQLリソースなので、専用メソッドで処理
- エラーハンドリングは `getLastError()` を使用
- NULL値の扱いに注意（PostgreSQLの仕様に準拠）

### 7. パフォーマンス

- `queryParams()`: 単発クエリに最適
- `prepareAndExecute()`: 同じクエリを繰り返す場合に高速
- パラメータ化により、SQLインジェクション対策も維持

## 使用例

### ユーザー情報取得

```php
$sql = "SELECT * FROM users WHERE user_id = :userId";
$result = PostgreSQLConnection::queryParams($sql, [':userId' => $userId]);

if ($result) {
    $user = PostgreSQLConnection::fetchAssoc($result);
    if ($user) {
        echo "ユーザー名: " . $user['user_name'];
    }
} else {
    echo "エラー: " . PostgreSQLConnection::getLastError();
}
```

### データの更新

```php
$sql = "UPDATE users SET user_name = :name WHERE user_id = :userId";
$result = PostgreSQLConnection::queryParams($sql, [
    ':name' => $newName,
    ':userId' => $userId
]);

if ($result && PostgreSQLConnection::affectedRows($result) > 0) {
    echo "更新成功";
} else {
    echo "更新失敗: " . PostgreSQLConnection::getLastError();
}
```

この実装により、`prepare()` が使用できない環境でも、安全で効率的なデータベースアクセスが可能になります。
