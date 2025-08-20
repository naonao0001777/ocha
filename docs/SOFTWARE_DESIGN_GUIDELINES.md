# ソフトウェア設計・コーディングガイドライン

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [アーキテクチャ設計原則](#アーキテクチャ設計原則)
3. [コーディング規約](#コーディング規約)
4. [セキュリティガイドライン](#セキュリティガイドライン)
5. [パフォーマンスガイドライン](#パフォーマンスガイドライン)
6. [テスト戦略](#テスト戦略)
7. [リファクタリング指針](#リファクタリング指針)
8. [品質チェックリスト](#品質チェックリスト)
9. [技術債務管理](#技術債務管理)

## プロジェクト概要

### システム構成

- **フロントエンド**: Next.js 15.4.6 + TypeScript + Tailwind CSS
- **バックエンド**: FastAPI + Python
- **データベース**: Supabase (PostgreSQL)
- **認証**: JWT + メールベース認証
- **デプロイ**: Docker + Vercel + Render
- **決済**: Stripe (SaaS課金)

### 主要機能

- ユーザープロフィール管理
- リンク集作成・管理
- SNSアカウント連携
- SaaS課金システム
- 多言語対応 (日本語/英語)

## アーキテクチャ設計原則

### 1. レイヤードアーキテクチャ

```text
┌─────────────────────────┐
│   Presentation Layer    │  ← Next.js Components
├─────────────────────────┤
│   Application Layer     │  ← API Routes, Business Logic
├─────────────────────────┤
│   Domain Layer          │  ← Core Business Rules
├─────────────────────────┤
│   Infrastructure Layer  │  ← Database, External APIs
└─────────────────────────┘
```

### 2. 関心の分離 (SoC: Separation of Concerns)

- **UI コンポーネント**: 表示ロジックのみ
- **ビジネスロジック**: ドメイン固有の処理
- **データアクセス**: データベース操作の抽象化
- **認証・認可**: セキュリティ関連の処理

### 3. 依存性の逆転 (DIP: Dependency Inversion Principle)

- 高レベルモジュールは低レベルモジュールに依存しない
- インターフェースを通じた疎結合設計

## コーディング規約

### TypeScript/JavaScript (フロントエンド)

#### 命名規則
```typescript
// ✅ Good
const userName = 'john_doe';
const UserProfile = () => {};
const API_ENDPOINT = 'https://api.example.com';
const isLoggedIn = true;

// ❌ Bad
const user_name = 'john_doe';
const userprofile = () => {};
const apiEndpoint = 'https://api.example.com';
const loggedIn = true;
```

#### 関数・コンポーネント設計
```typescript
// ✅ Good: 単一責任の原則
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Good: Props型定義
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, className }) => {
  // Implementation
};

// ❌ Bad: 複数の責任を持つ関数
const validateAndSubmitForm = (data: any) => {
  // validation logic
  // API call logic
  // UI update logic
};
```

#### エラーハンドリング
```typescript
// ✅ Good: 適切なエラーハンドリング
try {
  const response = await api.createUser(userData);
  return { success: true, data: response };
} catch (error) {
  if (error instanceof ApiError) {
    return { success: false, error: error.message };
  }
  logger.error('Unexpected error:', error);
  return { success: false, error: 'An unexpected error occurred' };
}

// ❌ Bad: エラーを無視
try {
  await api.createUser(userData);
} catch (error) {
  // Silent failure
}
```

### Python (バックエンド)

#### 命名規則
```python
# ✅ Good
user_name = "john_doe"
UserService = ...
API_BASE_URL = "https://api.example.com"

def get_user_profile(user_id: str) -> UserProfile:
    pass

class UserRepository:
    pass

# ❌ Bad
userName = "john_doe"
userService = ...
api_base_url = "https://api.example.com"

def getUserProfile(userId: str) -> UserProfile:
    pass
```

#### 型ヒント
```python
# ✅ Good: 明確な型ヒント
from typing import Optional, List, Dict, Any

def create_user(
    user_data: Dict[str, Any],
    db: Client
) -> Optional[UserResponse]:
    """ユーザーを作成する
    
    Args:
        user_data: ユーザー作成データ
        db: データベースクライアント
        
    Returns:
        作成されたユーザー情報、失敗時はNone
        
    Raises:
        ValueError: 無効なデータの場合
        DatabaseError: データベースエラーの場合
    """
    pass

# ❌ Bad: 型ヒントなし
def create_user(user_data, db):
    pass
```

#### エラーハンドリング
```python
# ✅ Good: 具体的な例外処理
try:
    user = db.table('users').select('*').eq('id', user_id).single().execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    return user.data
except HTTPException:
    # HTTPExceptionはそのまま再発生
    raise
except Exception as e:
    logger.error(f"Database error: {str(e)}")
    raise HTTPException(status_code=500, detail="Internal server error")

# ❌ Bad: 曖昧な例外処理
try:
    user = db.table('users').select('*').eq('id', user_id).single().execute()
    return user.data
except:
    raise HTTPException(status_code=500, detail="Error")
```

## セキュリティガイドライン

### 1. 認証・認可

#### JWT トークン管理
```typescript
// ✅ Good: 安全なトークン管理
const storeToken = (token: string) => {
  // HttpOnly cookieまたはメモリ内保存を推奨
  document.cookie = `token=${token}; HttpOnly; Secure; SameSite=Strict`;
};

// ❌ Bad: localStorage使用
localStorage.setItem('token', token);
```

#### パスワード処理
```python
# ✅ Good: 適切なハッシュ化
import hashlib
import secrets

def hash_password(password: str) -> str:
    salt = secrets.token_hex(32)
    password_hash = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt.encode('utf-8'), 
        100000  # 適切なイテレーション回数
    )
    return f"{salt}:{password_hash.hex()}"

# ❌ Bad: 弱いハッシュ化
import hashlib
def hash_password(password: str) -> str:
    return hashlib.md5(password.encode()).hexdigest()
```

### 2. 入力検証

```python
# ✅ Good: Pydanticによる検証
from pydantic import BaseModel, Field, validator

class CreateUserRequest(BaseModel):
    user_name: str = Field(..., min_length=1, max_length=50, regex=r'^[a-zA-Z0-9_]+$')
    email: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=8)
    
    @validator('email')
    def validate_email(cls, v):
        email_regex = r'^[^@]+@[^@]+\.[^@]+$'
        if not re.match(email_regex, v):
            raise ValueError('Invalid email format')
        return v

# ❌ Bad: 検証なし
def create_user(user_data: dict):
    # 直接データベースに挿入
    pass
```

### 3. CORS設定

```python
# ✅ Good: 適切なCORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://www.yourdomain.com"
    ],  # 本番環境では特定ドメインのみ
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ❌ Bad: 緩すぎるCORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## パフォーマンスガイドライン

### 1. フロントエンド最適化

#### React コンポーネント最適化
```typescript
// ✅ Good: メモ化の活用
import { memo, useMemo, useCallback } from 'react';

interface UserListProps {
  users: User[];
  onUserSelect: (user: User) => void;
}

const UserList = memo<UserListProps>(({ users, onUserSelect }) => {
  const sortedUsers = useMemo(() => 
    users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );
  
  const handleUserClick = useCallback((user: User) => {
    onUserSelect(user);
  }, [onUserSelect]);
  
  return (
    <div>
      {sortedUsers.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onClick={handleUserClick}
        />
      ))}
    </div>
  );
});

// ❌ Bad: 不要な再レンダリング
const UserList = ({ users, onUserSelect }) => {
  const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div>
      {sortedUsers.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onClick={() => onUserSelect(user)}
        />
      ))}
    </div>
  );
};
```

#### 画像最適化
```typescript
// ✅ Good: Next.js Image最適化
import Image from 'next/image';

const UserAvatar = ({ src, alt }: { src: string; alt: string }) => (
  <Image
    src={src}
    alt={alt}
    width={64}
    height={64}
    className="rounded-full"
    priority={false}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,..."
  />
);

// ❌ Bad: 最適化されていない画像
const UserAvatar = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="w-16 h-16 rounded-full" />
);
```

### 2. バックエンド最適化

#### データベースクエリ最適化
```python
# ✅ Good: 効率的なクエリ
def get_user_profile(user_id: str, sb: Client) -> UserProfileResponse:
    # 必要なフィールドのみ選択
    user_result = sb.table('users').select(
        'id, user_name, name, email, biography, profile_image, created_at, updated_at'
    ).eq('user_name', user_id).eq('is_deleted', False).single().execute()
    
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 関連データを効率的に取得
    user_id_internal = user_result.data['id']
    links_result = sb.table('links').select('*').eq('user_id', user_id_internal).order('order_index').execute()
    social_result = sb.table('social_accounts').select('*').eq('user_id', user_id_internal).execute()
    
    return UserProfileResponse(...)

# ❌ Bad: N+1問題
def get_user_profiles(sb: Client) -> List[UserProfileResponse]:
    users = sb.table('users').select('*').execute()
    
    profiles = []
    for user in users.data:
        # 各ユーザーごとに個別クエリ（N+1問題）
        links = sb.table('links').select('*').eq('user_id', user['id']).execute()
        social = sb.table('social_accounts').select('*').eq('user_id', user['id']).execute()
        profiles.append(UserProfileResponse(...))
    
    return profiles
```

#### キャッシュ戦略
```python
# ✅ Good: 適切なキャッシュ実装
from functools import lru_cache
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

@lru_cache(maxsize=100)
def get_user_settings(user_id: str) -> dict:
    """ユーザー設定取得（メモリキャッシュ）"""
    pass

def get_user_profile_cached(user_id: str) -> dict:
    """ユーザープロフィール取得（Redisキャッシュ）"""
    cache_key = f"user_profile:{user_id}"
    cached_data = redis_client.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data)
    
    # データベースから取得
    profile = get_user_profile(user_id)
    
    # キャッシュに保存（5分間）
    redis_client.setex(cache_key, 300, json.dumps(profile))
    
    return profile
```

## テスト戦略

### 1. テストピラミッド

```
        /\
       /  \
      / E2E \    ← 少数の包括的テスト
     /______\
    /        \
   /Integration\ ← 中程度の統合テスト
  /__________\
 /            \
/   Unit Tests  \ ← 多数の単体テスト
/________________\
```

### 2. フロントエンドテスト

#### コンポーネントテスト
```typescript
// UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  };

  it('should display user name and email', () => {
    render(<UserCard user={mockUser} onEdit={() => {}} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

#### APIテスト
```typescript
// api.test.ts
import { apiClient } from './api';
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('apiClient', () => {
  it('should login successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      success: true,
      access_token: 'mock-token'
    }));

    const result = await apiClient.login('test@example.com', 'password');

    expect(result.success).toBe(true);
    expect(result.access_token).toBe('mock-token');
  });

  it('should handle login failure', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'));

    await expect(apiClient.login('test@example.com', 'wrong'))
      .rejects.toThrow('Network error');
  });
});
```

### 3. バックエンドテスト

#### APIエンドポイントテスト
```python
# test_users.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

@pytest.fixture
def client():
    from app import app
    return TestClient(app)

@pytest.fixture
def mock_supabase():
    return Mock()

def test_create_user_success(client, mock_supabase):
    # モックの設定
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{"id": "1", "user_name": "test"}]
    
    with patch('app.get_supabase_client', return_value=mock_supabase):
        response = client.post("/users", json={
            "user_name": "testuser",
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123"
        })
    
    assert response.status_code == 201
    assert response.json()["user_name"] == "testuser"

def test_create_user_duplicate_email(client, mock_supabase):
    # 重複メール
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": "1"}]
    
    with patch('app.get_supabase_client', return_value=mock_supabase):
        response = client.post("/users", json={
            "user_name": "testuser",
            "name": "Test User",
            "email": "existing@example.com",
            "password": "password123"
        })
    
    assert response.status_code == 400
    assert "Email address is already in use" in response.json()["detail"]
```

## リファクタリング指針

### 1. リファクタリング優先度

#### 緊急度：高
- **セキュリティ脆弱性**: 即座に修正
- **パフォーマンス問題**: ユーザー体験に直接影響
- **重大なバグ**: システム機能を阻害

#### 緊急度：中
- **コード重複**: DRY原則違反
- **長すぎる関数**: 単一責任原則違反
- **複雑すぎるロジック**: 認知的複雑度が高い

#### 緊急度：低
- **命名改善**: より分かりやすい名前
- **コメント追加**: ドキュメント改善
- **コード整理**: 美観の向上

### 2. リファクタリング手順

#### ステップ1: 分析
```bash
# コード品質分析
npm run lint
npm run type-check

# テストカバレッジ確認
npm run test:coverage

# 複雑度分析
npm run complexity
```

#### ステップ2: テスト準備
- 既存のテストが十分か確認
- 不足部分のテストを追加
- リファクタリング前のベースライン確立

#### ステップ3: 小さな変更から開始
```typescript
// ❌ Before: 長い関数
const processUserData = (userData: any) => {
  // 50行以上のロジック
};

// ✅ After: 小さな関数に分割
const validateUserData = (userData: UserData): ValidationResult => {
  // バリデーションロジック
};

const transformUserData = (userData: UserData): TransformedData => {
  // 変換ロジック
};

const saveUserData = (data: TransformedData): Promise<SaveResult> => {
  // 保存ロジック
};

const processUserData = async (userData: UserData) => {
  const validation = validateUserData(userData);
  if (!validation.isValid) return validation;
  
  const transformed = transformUserData(userData);
  return await saveUserData(transformed);
};
```

#### ステップ4: テスト実行
```bash
# 全テスト実行
npm run test

# E2Eテスト実行
npm run test:e2e

# パフォーマンステスト
npm run test:performance
```

### 3. 技術債務の分類

#### Type A: アーキテクチャ債務
- 設計パターンの不適用
- レイヤー違反
- 循環依存

#### Type B: コード債務
- 重複コード
- デッドコード
- 複雑すぎるロジック

#### Type C: テスト債務
- テストカバレッジ不足
- 壊れやすいテスト
- テストの重複

#### Type D: ドキュメント債務
- 古いドキュメント
- 不正確な仕様書
- コメント不足

## 品質チェックリスト

### コード品質

#### フロントエンド
- [ ] TypeScript型安全性確保
- [ ] ESLintルール適用
- [ ] Prettierコード整形
- [ ] コンポーネント単一責任
- [ ] Propsインターフェース定義
- [ ] エラーバウンダリ実装
- [ ] アクセシビリティ対応
- [ ] パフォーマンス最適化

#### バックエンド
- [ ] 型ヒント完備
- [ ] Pydantic検証
- [ ] エラーハンドリング
- [ ] ログ出力適切
- [ ] セキュリティ対策
- [ ] データベース最適化
- [ ] API仕様書更新
- [ ] テストカバレッジ80%以上

### セキュリティ

- [ ] 入力検証実装
- [ ] SQL/NoSQLインジェクション対策
- [ ] XSS攻撃対策
- [ ] CSRF攻撃対策
- [ ] 認証・認可実装
- [ ] ログイン試行制限
- [ ] セッション管理適切
- [ ] HTTPS使用
- [ ] 秘密情報環境変数管理
- [ ] 依存関係脆弱性チェック

### パフォーマンス

- [ ] レスポンス時間2秒以下
- [ ] データベースクエリ最適化
- [ ] 画像最適化
- [ ] キャッシュ戦略実装
- [ ] バンドルサイズ最適化
- [ ] Core Web Vitals良好
- [ ] モバイル対応
- [ ] オフライン対応検討

### 運用・保守性

- [ ] ログ監視設定
- [ ] エラー追跡設定
- [ ] ヘルスチェック実装
- [ ] バックアップ戦略
- [ ] デプロイ自動化
- [ ] ロールバック手順
- [ ] ドキュメント最新
- [ ] チーム知識共有

## 技術債務管理

### 1. 債務の可視化

#### 技術債務レジスター
```markdown
| ID | 分類 | 説明 | 影響度 | 緊急度 | 工数見積 | 担当者 | 期限 |
|----|------|------|--------|--------|----------|--------|------|
| TD001 | セキュリティ | パスワードハッシュ化改善 | 高 | 高 | 4h | @dev1 | 2025-09-01 |
| TD002 | パフォーマンス | データベースインデックス | 中 | 中 | 8h | @dev2 | 2025-09-15 |
| TD003 | 保守性 | ログ出力標準化 | 低 | 低 | 16h | @dev3 | 2025-10-01 |
```

### 2. 優先度マトリックス

```
    緊急度
      ↑
高 │ 🔴 即修正 │ 🟡 計画修正 │
   │-----------|------------|
低 │ 🟢 監視継続 │ ⚪ 将来対応 │
   └───────────┴────────────┘
      低 ←─ 影響度 ─→ 高
```

### 3. 継続的改善

#### 週次レビュー
- 新規技術債務の特定
- 既存債務の進捗確認
- 優先度の見直し

#### 月次評価
- 技術債務メトリクス分析
- チーム生産性への影響評価
- 改善策の効果測定

#### 四半期計画
- 大規模リファクタリング計画
- アーキテクチャ改善計画
- 新技術導入検討

---

## まとめ

このガイドラインは、Ochaプロジェクトの品質向上と持続可能な開発を目的としています。

### 重要ポイント
1. **品質第一**: 新機能開発よりも品質確保を優先
2. **継続的改善**: 小さな改善を積み重ねる
3. **チーム協力**: コードレビューと知識共有
4. **自動化推進**: 手動作業の削減
5. **ドキュメント保守**: 常に最新状態を維持

### 次のアクション
1. このガイドラインの全チーム共有
2. 現在のコードベース評価
3. 優先度付き改善計画作成
4. 定期的な品質レビュー実施

**最終更新**: 2025年8月21日  
**版数**: v1.0.0  
**次回見直し**: 2025年11月21日
