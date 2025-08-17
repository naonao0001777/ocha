-- Phase 1: SaaS化のための新規テーブル追加
-- 既存テーブルには一切手を加えず、新規テーブルのみ追加

-- 1. サブスクリプションプラン定義テーブル
CREATE TABLE subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 'Free', 'Pro'
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'free', 'pro'
    price_monthly INTEGER NOT NULL, -- 月額料金（円）0 or 500
    price_yearly INTEGER, -- 年額料金（円）0 or 5000
    stripe_price_id_monthly VARCHAR(255), -- Stripe価格ID（月額）
    stripe_price_id_yearly VARCHAR(255), -- Stripe価格ID（年額）
    max_links INTEGER NOT NULL, -- 最大リンク数 3 or 10
    has_themes BOOLEAN DEFAULT false, -- テーマ選択可能か
    has_ads BOOLEAN DEFAULT true, -- 広告表示があるか
    is_active BOOLEAN DEFAULT true, -- プラン有効フラグ
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ユーザーサブスクリプション管理テーブル
CREATE TABLE user_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id BIGINT REFERENCES subscription_plans(id),
    stripe_subscription_id VARCHAR(255) UNIQUE, -- StripeサブスクリプションID
    stripe_customer_id VARCHAR(255), -- Stripe顧客ID
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, canceled, past_due, etc.
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 year',
    trial_end TIMESTAMPTZ, -- トライアル終了日
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- 1ユーザーは1つのアクティブなサブスクリプションのみ
    UNIQUE(user_id)
);

-- 3. 使用量制限管理テーブル（シンプル化）
CREATE TABLE usage_limits (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id BIGINT REFERENCES subscription_plans(id),
    current_links_count INTEGER DEFAULT 0, -- 現在のリンク数
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- 1ユーザー1レコード
    UNIQUE(user_id)
);

-- 4. 決済履歴テーブル
CREATE TABLE payment_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255), -- Stripe決済インテントID
    amount INTEGER NOT NULL, -- 金額（円）
    currency VARCHAR(3) DEFAULT 'jpy', -- 通貨
    status VARCHAR(50) NOT NULL, -- succeeded, failed, pending, etc.
    description TEXT, -- 決済説明
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. インデックス作成
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_usage_limits_user_id ON usage_limits(user_id);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_stripe_payment_intent ON payment_history(stripe_payment_intent_id);

-- 6. Updated_at自動更新トリガー設定
CREATE TRIGGER handle_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_usage_limits_updated_at
  BEFORE UPDATE ON usage_limits
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 7. 初期プランデータ挿入
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, max_links, has_themes, has_ads) VALUES
('Free', 'free', 0, 0, 3, false, true),
('Pro', 'pro', 500, 5000, 10, true, false);

-- 8. 既存全ユーザーをFreeプランに自動割当
INSERT INTO user_subscriptions (user_id, plan_id, status)
SELECT 
    u.id as user_id,
    (SELECT id FROM subscription_plans WHERE slug = 'free') as plan_id,
    'active' as status
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_subscriptions us WHERE us.user_id = u.id
);

-- 9. 既存ユーザーの使用量初期化
INSERT INTO usage_limits (user_id, plan_id, current_links_count)
SELECT 
    u.id as user_id,
    (SELECT id FROM subscription_plans WHERE slug = 'free') as plan_id,
    COALESCE(link_counts.link_count, 0) as current_links_count
FROM users u
LEFT JOIN (
    SELECT user_id, COUNT(*) as link_count
    FROM links
    GROUP BY user_id
) link_counts ON u.id = link_counts.user_id
WHERE NOT EXISTS (
    SELECT 1 FROM usage_limits ul WHERE ul.user_id = u.id
);

-- 10. 確認用クエリ（実行後の状態確認）
-- SELECT 
--     u.user_name,
--     u.name,
--     sp.name as plan_name,
--     us.status,
--     ul.current_links_count,
--     sp.max_links
-- FROM users u
-- JOIN user_subscriptions us ON u.id = us.user_id
-- JOIN subscription_plans sp ON us.plan_id = sp.id
-- JOIN usage_limits ul ON u.id = ul.user_id
-- ORDER BY u.created_at;
