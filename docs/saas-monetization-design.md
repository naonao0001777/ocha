# Ocha SaaS化・課金機能 設計書

## 1. 概要

Ochaをフリーミアムモデルの SaaS プラットフォームに転換し、Stripe を活用した課金システムを実装する。

### 1.1 目的
- 持続可能なビジネスモデルの確立
- プレミアム機能による収益化
- ユーザーエクスペリエンスの向上

### 1.2 課金モデル
**フリーミアム + サブスクリプション**
- 基本機能は無料
- プレミアム機能は月額制

## 2. プラン設計

### 2.1 Free Plan（無料プラン）
**料金**: ¥0/月
**機能制限**:
- リンク数: 最大3個
- プロフィール画像: カスタムアップロード可能
- テーマ: デフォルトテーマのみ（1種類）
- 広告表示: あり（プロフィールページ下部に表示）
リンク数: 最大3個
プロフィール画像: カスタムアップロード可能
テーマ: デフォルトテーマのみ（1種類）
広告表示: あり（プロフィールページ下部に表示）

### 2.2 Pro Plan（プロプラン）
**料金**: ¥500/月 または ¥5,000/年（年間プランで17%割引）
**機能**:
- リンク数: 最大10個（5個以上追加可能）
- プロフィール画像: カスタムアップロード可能
- テーマ: 全テーマから選択可能（複数のデザインテーマ）
- 広告表示: なし（完全広告非表示）
- プライオリティサポート

## 3. 技術実装設計

### 3.1 データベース設計

#### 3.1.1 新規テーブル

```sql
-- サブスクリプションプラン
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 'Free', 'Pro'
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'free', 'pro'
    price_monthly INTEGER NOT NULL, -- 月額料金（円）0 or 500
    price_yearly INTEGER, -- 年額料金（円）0 or 5000
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    max_links INTEGER NOT NULL, -- 3 or 10
    has_themes BOOLEAN DEFAULT false, -- テーマ選択可能か
    has_ads BOOLEAN DEFAULT true, -- 広告表示があるか
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ挿入
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, max_links, has_themes, has_ads) VALUES
('Free', 'free', 0, 0, 3, false, true),
('Pro', 'pro', 500, 5000, 10, true, false);

-- ユーザーサブスクリプション
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- active, canceled, past_due, etc.
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 使用量制限テーブル（シンプル化）
CREATE TABLE usage_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    current_links_count INTEGER DEFAULT 0, -- 現在のリンク数
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 決済履歴
CREATE TABLE payment_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255),
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'jpy',
    status VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.2 既存テーブルの拡張

```sql
-- usersテーブルにカラム追加
ALTER TABLE users ADD COLUMN subscription_id INTEGER REFERENCES user_subscriptions(id);
ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMP;
ALTER TABLE users ADD COLUMN is_trial_used BOOLEAN DEFAULT false;

-- linksテーブルにアナリティクス用カラム追加
ALTER TABLE links ADD COLUMN click_count INTEGER DEFAULT 0;
ALTER TABLE links ADD COLUMN last_clicked_at TIMESTAMP;
```

### 3.2 フロントエンド実装

#### 3.2.1 新規ページ

1. **料金プランページ** (`/pricing`)
   - プラン比較表
   - 機能一覧
   - FAQ セクション

2. **決済ページ** (`/checkout`)
   - Stripe Checkout 統合
   - プラン選択
   - 年間/月間切り替え

3. **アカウント設定/課金管理** (`/account/billing`)
   - 現在のプラン表示
   - 使用量表示
   - プラン変更
   - 請求履歴
   - サブスクリプション解約

4. **アナリティクスダッシュボード** (`/analytics`)
   - クリック統計
   - 訪問者数
   - 人気リンクランキング

#### 3.2.2 コンポーネント設計

```typescript
// プラン制限チェック用 Hook
interface PlanLimits {
  maxLinks: number;
  hasCustomDomain: boolean;
  hasAnalytics: boolean;
  hasCustomThemes: boolean;
  hasCustomCSS: boolean;
}

const usePlanLimits = () => {
  // ユーザーのプランに基づいて制限を返す
};

// 使用量チェック用 Hook
const useUsageCheck = () => {
  // 現在の使用量と制限を比較
};
```

### 3.3 バックエンド実装

#### 3.3.1 Stripe 関連 API

```python
# stripe_service.py
class StripeService:
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
    
    def create_customer(self, email: str, name: str) -> str:
        """Stripe顧客を作成"""
        pass
    
    def create_checkout_session(self, 
                              customer_id: str, 
                              price_id: str, 
                              success_url: str, 
                              cancel_url: str) -> str:
        """チェックアウトセッションを作成"""
        pass
    
    def handle_webhook(self, payload: bytes, sig_header: str):
        """Webhookイベントを処理"""
        pass
    
    def cancel_subscription(self, subscription_id: str):
        """サブスクリプションをキャンセル"""
        pass
```

#### 3.3.2 プラン制限チェック

```python
# plan_limits.py
class PlanLimitChecker:
    def __init__(self, user_id: int):
        self.user = self.get_user_with_subscription(user_id)
        self.plan = self.get_user_plan()
    
    def can_add_link(self) -> bool:
        """リンク追加可能かチェック"""
        current_count = self.get_current_links_count()
        return current_count < self.plan.max_links
    
    def can_select_theme(self) -> bool:
        """テーマ選択可能かチェック"""
        return self.plan.has_themes
    
    def should_show_ads(self) -> bool:
        """広告表示が必要かチェック"""
        return self.plan.has_ads
```

### 3.4 セキュリティ考慮事項

1. **Stripe Webhook 認証**
   - Webhook署名の検証
   - IPアドレス制限

2. **プラン制限の強制**
   - フロントエンド・バックエンド両方での制限チェック
   - API レート制限

3. **決済情報の取り扱い**
   - PCI DSS準拠（Stripeに委託）
   - 決済情報の直接保存なし

## 4. 段階的実装戦略（既存データ保護優先）

### Phase 0: 事前準備・リスク回避（1週間）
- [ ] 既存データベースの完全バックアップ
- [ ] 開発環境での動作確認
- [ ] ロールバック手順の策定
- [ ] 既存ユーザーへの事前通知準備

### Phase 1: データベース安全拡張（1週間）
**既存データに影響しない新規テーブル追加のみ**
- [ ] `subscription_plans`テーブルの作成
- [ ] `user_subscriptions`テーブルの作成
- [ ] `usage_limits`テーブルの作成
- [ ] `payment_history`テーブルの作成
- [ ] 初期データ（Free/Proプラン）の挿入
- [ ] 既存ユーザーをデフォルトでFreeプランに自動割当

### Phase 2: UI/UX実装（無課金機能）（2週間）
**既存機能に影響しないページ追加・表示変更のみ**
- [ ] 料金プランページ（`/pricing`）の作成
- [ ] アカウント設定ページ（`/account`）の作成
- [ ] 現在のプラン表示機能
- [ ] プラン比較表示
- [ ] 「アップグレード」ボタン（まだ非機能）
- [ ] テーマ選択UI（Pro限定表示のみ、まだ制限なし）

### Phase 3: プラン制限機能（段階的制限）（2週間）
**既存ユーザーの機能を段階的に調整**
- [ ] プラン制限チェック機能の実装
- [ ] リンク数制限の段階的導入（警告→制限）
  - Week 1: 3個以上で警告表示のみ
  - Week 2: 新規追加時のみ制限開始
- [ ] テーマ選択制限の実装
- [ ] 広告表示システムの準備（まだ非表示）

### Phase 4: 決済機能統合（2週間）
**実際の課金システムを有効化**
- [ ] Stripe環境設定（本番・テスト）
- [ ] Stripe Checkout統合
- [ ] Webhook処理実装
- [ ] サブスクリプション管理機能
- [ ] 決済成功時のプラン自動アップグレード
- [ ] トライアル機能実装

### Phase 5: 完全運用開始（1週間）
**全機能の有効化と最終調整**
- [ ] 広告表示機能の有効化
- [ ] 全制限の完全実施
- [ ] 課金管理ダッシュボード
- [ ] サポート機能
- [ ] モニタリング・アラート設定

## 4.1 既存データ保護戦略

### マイグレーション安全策
```sql
-- 1. 既存ユーザーをFreeプランに自動割当
INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
SELECT 
    id as user_id,
    (SELECT id FROM subscription_plans WHERE slug = 'free') as plan_id,
    'active' as status,
    CURRENT_TIMESTAMP as current_period_start,
    CURRENT_TIMESTAMP + INTERVAL '1 year' as current_period_end
FROM users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions);

-- 2. 既存リンク数カウントの初期化
INSERT INTO usage_limits (user_id, plan_id, current_links_count)
SELECT 
    u.id as user_id,
    (SELECT id FROM subscription_plans WHERE slug = 'free') as plan_id,
    COUNT(l.id) as current_links_count
FROM users u
LEFT JOIN links l ON u.id = l.user_id
GROUP BY u.id;
```

### 段階的制限導入
1. **Week 1-2**: 制限表示のみ（実制限なし）
2. **Week 3-4**: 新規追加のみ制限
3. **Week 5+**: 完全制限実施

## 4.2 具体的な実装手順

### Phase 1実装詳細: データベース安全拡張

#### Step 1.1: 新規テーブル作成
```sql
-- 本番環境への適用前に開発環境で十分テスト
-- 既存データには一切触らない

-- 1. プラン定義テーブル
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    price_monthly INTEGER NOT NULL,
    price_yearly INTEGER,
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    max_links INTEGER NOT NULL,
    has_themes BOOLEAN DEFAULT false,
    has_ads BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 初期プランデータ挿入
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, max_links, has_themes, has_ads) VALUES
('Free', 'free', 0, 0, 3, false, true),
('Pro', 'pro', 500, 5000, 10, true, false);
```

#### Step 1.2: ユーザーサブスクリプション管理
```sql
-- 3. ユーザーのサブスクリプション状況
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 year',
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 既存全ユーザーをFreeプランに自動割当
INSERT INTO user_subscriptions (user_id, plan_id, status)
SELECT 
    id as user_id,
    (SELECT id FROM subscription_plans WHERE slug = 'free') as plan_id,
    'active' as status
FROM users;
```

### Phase 2実装詳細: UI/UX実装

#### Step 2.1: 料金プランページ作成
```typescript
// frontend/src/app/pricing/page.tsx
export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">料金プラン</h1>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan Card */}
        <PlanCard 
          name="Free"
          price="¥0"
          features={['リンク3個まで', 'デフォルトテーマ', '広告表示あり']}
          buttonText="現在のプラン"
          disabled
        />
        
        {/* Pro Plan Card */}
        <PlanCard 
          name="Pro"
          price="¥500"
          period="/月"
          features={['リンク10個まで', '全テーマ選択可能', '広告なし']}
          buttonText="アップグレード"
          highlighted
        />
      </div>
    </div>
  );
}
```

#### Step 2.2: アカウント設定ページ
```typescript
// frontend/src/app/account/page.tsx
export default function AccountPage() {
  const { user, subscription } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">アカウント設定</h1>
      
      <div className="grid gap-6">
        {/* 現在のプラン表示 */}
        <Card>
          <CardHeader>
            <CardTitle>現在のプラン</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{subscription?.plan?.name || 'Free'}</p>
                <p className="text-sm text-gray-600">
                  リンク数: {subscription?.plan?.max_links || 3}個まで
                </p>
              </div>
              {subscription?.plan?.slug === 'free' && (
                <Button>プロにアップグレード</Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* 使用状況表示 */}
        <UsageDisplay />
      </div>
    </div>
  );
}
```

### Phase 3実装詳細: プラン制限機能

#### Step 3.1: 段階的制限導入戦略
```typescript
// lib/planLimits.ts
export class PlanLimitChecker {
  constructor(private user: User, private subscription: UserSubscription) {}
  
  canAddLink(): { allowed: boolean; reason?: string } {
    const currentCount = this.getCurrentLinksCount();
    const maxLinks = this.subscription.plan.max_links;
    
    if (currentCount >= maxLinks) {
      return {
        allowed: false,
        reason: `${this.subscription.plan.name}プランでは最大${maxLinks}個までです`
      };
    }
    
    return { allowed: true };
  }
  
  // Week 1-2: 警告のみ
  getLinkLimitWarning(): string | null {
    const currentCount = this.getCurrentLinksCount();
    const maxLinks = this.subscription.plan.max_links;
    
    if (currentCount >= maxLinks) {
      return `リンク数が上限に達しています。Proプランで更多くのリンクを追加できます。`;
    }
    
    if (currentCount >= maxLinks - 1) {
      return `あと${maxLinks - currentCount}個でリンク上限です。`;
    }
    
    return null;
  }
}
```

### 実装時の注意点

#### 1. 既存データの保護
- **絶対にやってはいけない**
  - 既存テーブルのカラム削除
  - 既存データの一括更新
  - 外部キー制約の既存テーブルへの追加

- **安全な操作のみ**
  - 新規テーブルの追加
  - 新規カラムの追加（DEFAULT値あり）
  - 読み取り専用の操作

#### 2. 段階的制限導入
- **Week 1**: 制限表示のみ（実際の制限なし）
- **Week 2**: 新規追加時のみ制限開始
- **Week 3**: 既存リンクの編集制限
- **Week 4**: 完全制限実施

#### 3. ユーザーコミュニケーション
- 変更の3週間前通知
- 制限開始の1週間前通知
- 制限開始時の丁寧なガイダンス

#### 4. 緊急時対応
- いつでもロールバック可能な設計
- 制限機能のON/OFF切り替え可能
- ユーザーサポート体制の強化

## 5. マーケティング戦略

### 5.1 フリートライアル
- 新規ユーザーに14日間のProプラン無料体験
- トライアル終了前の通知システム

### 5.2 段階的移行
- 既存無料ユーザーへの影響を最小限に
- 3ヶ月の移行期間を設定
- 丁寧な案内とサポート

### 5.3 プロモーション
- ローンチ記念20%オフ
- 年間プラン17%割引
- 学生・非営利団体向け割引

## 6. KPI・成功指標

- **コンバージョン率**: 無料→有料への転換率 目標5%
- **MRR（月次経常収益）**: 目標月間50万円（6ヶ月後）
- **チャーンレート**: 月次解約率 目標5%以下
- **ARPU**: ユーザー当たり平均収益 目標800円/月

## 7. リスクと対策

### 7.1 技術的リスク
- **Stripe API障害**: バックアップ決済手段の検討
- **スケーラビリティ**: インフラの自動スケーリング

### 7.2 ビジネスリスク
- **ユーザー離脱**: 段階的な制限導入
- **競合サービス**: 独自機能の強化

### 7.3 法的リスク
- **特定商取引法**: 適切な表示義務の履行
- **消費者契約法**: 公正な契約条件

## 8. 次のステップ

1. **チーム承認**: この設計書のレビューと承認
2. **開発環境準備**: Stripeテストアカウント設定
3. **詳細設計**: 各コンポーネントの詳細仕様策定
4. **実装開始**: Phase 1からの順次実装

---

この設計書に基づいて、段階的にSaaS化を進めることで、持続可能で成長性のあるビジネスモデルを構築できます。
