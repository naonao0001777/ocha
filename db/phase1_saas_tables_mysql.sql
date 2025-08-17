-- Phase 1: SaaS化のための新規テーブル追加（MySQL版）
-- 既存テーブルには一切手を加えず、新規テーブルのみ追加

-- 1. サブスクリプションプラン定義テーブル
CREATE TABLE subscription_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT 'Free, Pro',
    slug VARCHAR(50) UNIQUE NOT NULL COMMENT 'free, pro',
    price_monthly INT NOT NULL COMMENT '月額料金（円）0 or 500',
    price_yearly INT COMMENT '年額料金（円）0 or 5000',
    stripe_price_id_monthly VARCHAR(255) COMMENT 'Stripe価格ID（月額）',
    stripe_price_id_yearly VARCHAR(255) COMMENT 'Stripe価格ID（年額）',
    max_links INT NOT NULL COMMENT '最大リンク数 3 or 10',
    has_themes BOOLEAN DEFAULT FALSE COMMENT 'テーマ選択可能か',
    has_ads BOOLEAN DEFAULT TRUE COMMENT '広告表示があるか',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'プラン有効フラグ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. ユーザーサブスクリプション管理テーブル
CREATE TABLE user_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL COMMENT 'users.idへの参照（UUID文字列）',
    plan_id BIGINT NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE COMMENT 'StripeサブスクリプションID',
    stripe_customer_id VARCHAR(255) COMMENT 'Stripe顧客ID',
    status VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT 'active, canceled, past_due, etc.',
    current_period_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 YEAR),
    trial_end TIMESTAMP COMMENT 'トライアル終了日',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    UNIQUE KEY unique_user_subscription (user_id)
);

-- 3. 使用量制限管理テーブル（シンプル化）
CREATE TABLE usage_limits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL COMMENT 'users.idへの参照（UUID文字列）',
    plan_id BIGINT NOT NULL,
    current_links_count INT DEFAULT 0 COMMENT '現在のリンク数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    UNIQUE KEY unique_user_usage (user_id)
);

-- 4. 決済履歴テーブル
CREATE TABLE payment_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL COMMENT 'users.idへの参照（UUID文字列）',
    stripe_payment_intent_id VARCHAR(255) COMMENT 'Stripe決済インテントID',
    amount INT NOT NULL COMMENT '金額（円）',
    currency VARCHAR(3) DEFAULT 'jpy' COMMENT '通貨',
    status VARCHAR(50) NOT NULL COMMENT 'succeeded, failed, pending, etc.',
    description TEXT COMMENT '決済説明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_payment_history_user_id (user_id),
    INDEX idx_payment_history_stripe_payment_intent (stripe_payment_intent_id)
);

-- 5. インデックス作成
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_usage_limits_user_id ON usage_limits(user_id);

-- 6. 初期プランデータ挿入
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, max_links, has_themes, has_ads) VALUES
('Free', 'free', 0, 0, 3, FALSE, TRUE),
('Pro', 'pro', 500, 5000, 10, TRUE, FALSE);

-- 注意: 既存ユーザーの自動割当は、既存のusersテーブル構造確認後に実行
