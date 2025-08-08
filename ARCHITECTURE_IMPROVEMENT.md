# アーキテクチャ改善ドキュメント

## 概要

このプロジェクトのデータベースアクセス層を改善し、準備されたステートメント（prepared statements）を適切に使用できるようにリファクタリングしました。

## 新しいアーキテクチャの特徴

### 1. レイヤー分離
- **Model層**: データの構造を定義（`User.php`）
- **Repository層**: データアクセスロジック（`UserRepository.php`）
- **Service層**: ビジネスロジック（`UserService.php`, `FileUploadService.php`）
- **Controller層**: リクエスト処理（`adminEdit_new.php`）

### 2. 依存性注入
- `ServiceContainer.php`を使用してサービス間の依存関係を管理
- テストしやすい構造に改善

### 3. インターフェース使用
- `DatabaseConnectionInterface.php`
- `UserRepositoryInterface.php`
- 実装の切り替えが容易

## 新しいファイル構造

```
app/
├── interfaces/
│   ├── DatabaseConnectionInterface.php
│   └── UserRepositoryInterface.php
├── models/
│   └── User.php
├── repositories/
│   └── UserRepository.php
├── services/
│   ├── ServiceContainer.php
│   ├── UserService.php
│   └── FileUploadService.php
├── database/
│   └── DatabaseConnection.php (新)
└── routes/
    ├── adminEdit.php (旧)
    └── adminEdit_new.php (新)
```

## 使用例

### 基本的な使い方

```php
// サービスコンテナの初期化
$container = ServiceContainer::getInstance();
$container->initializeDefaultServices();

// ユーザーサービスの取得
$userService = $container->getUserService();

// ユーザー情報の取得
$user = $userService->getUserById('user123');

// プロフィール画像の更新
$result = $userService->updateProfileImage('user123', $_FILES['image']);
if ($result['success']) {
    echo $result['message'];
}
```

### データベース操作

```php
// ユーザーリポジトリの直接使用
$userRepository = $container->getUserRepository();

// 新しいユーザーの作成
$user = new User('user123', 'password', 'email@example.com', 'Username');
$userRepository->create($user);

// ユーザーの検索
$foundUser = $userRepository->findByUserId('user123');
```

## 主な改善点

### 1. データベース接続の改善
- PDOオプションの適切な設定
- エラーハンドリングの改善
- 接続の再利用

### 2. プリペアドステートメントの適切な使用
- SQLインジェクション対策
- パフォーマンスの向上
- パラメーターバインディングの統一

### 3. エラーハンドリング
- 例外処理の統一
- ユーザーフレンドリーなエラーメッセージ
- ログ記録の準備

### 4. テスタビリティ
- モックオブジェクトの使用が可能
- 依存性注入によるテストの簡素化
- 単体テストの作成が容易

## 移行方法

### 段階的移行

1. **新しいクラスの導入**: 既存コードを変更せずに新しいクラスを追加
2. **新しいエンドポイントでのテスト**: `adminEdit_new.php`でテスト
3. **既存コードの置き換え**: 動作確認後、既存のファイルを置き換え

### 既存コードとの互換性

```php
// 旧: 直接的なデータベースアクセス
$dbh = DatabaseConnection::Connection();
$stmt = $dbh->prepare($sql);

// 新: サービス層を通したアクセス
$userService = $container->getUserService();
$result = $userService->updateProfileImage($userId, $fileInfo);
```

## 今後の改善予定

### 1. Linkサービスの作成
リンク関連の操作を分離するためのサービスクラス

### 2. バリデーション層
入力値検証のための専用クラス

### 3. ログ機能
エラーログとアクセスログの実装

### 4. キャッシュ機能
データベースアクセスの最適化

### 5. 設定管理
設定ファイルの構造化と環境別設定

## メリット

1. **保守性**: コードの責務が明確で修正が容易
2. **拡張性**: 新機能の追加が簡単
3. **テスト性**: 各層を独立してテスト可能
4. **セキュリティ**: SQLインジェクション対策の強化
5. **パフォーマンス**: プリペアドステートメントによる最適化
