-- Ocha Profile Service Database Schema for Local PostgreSQL
-- Adapted from Supabase schema for local development

-- Create database (this will be handled by docker-compose)
-- CREATE DATABASE ocha_dev;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users テーブル
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_name TEXT UNIQUE NOT NULL, -- プロフィールURL用のユーザー名 (/u/{user_name})
  name TEXT NOT NULL, -- 表示名
  email TEXT UNIQUE NOT NULL, -- メールアドレス（重複不可）
  password_hash TEXT NOT NULL, -- パスワードハッシュ（認証用）
  biography TEXT, -- プロフィール文
  profile_image TEXT, -- プロフィール画像のURL
  is_deleted BOOLEAN NOT NULL DEFAULT false, -- アカウント論理削除フラグ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Links テーブル（ユーザーが追加するリンク）
CREATE TABLE links (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- リンクのタイトル
  url TEXT NOT NULL, -- リンクのURL
  order_index INTEGER DEFAULT 0, -- 表示順序
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Accounts テーブル（SNSアカウント）
CREATE TABLE social_accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'x', 'twitch', 'github', 'instagram', 'facebook')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- 1ユーザーにつき1プラットフォームのみ
  UNIQUE(user_id, platform)
);

-- インデックス作成
CREATE INDEX idx_users_user_name ON users(user_name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_order ON links(user_id, order_index);
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);

-- Updated_at 自動更新のためのトリガー関数
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Updated_at トリガー設定
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- テストデータ挿入（開発用）
-- パスワードハッシュは "password" をハッシュ化したもの（開発用）
INSERT INTO users (user_name, name, email, password_hash, biography, created_at, updated_at) VALUES
  ('demo', 'デモユーザー', 'demo@example.com', 'salt:hash', 'これはデモプロフィールです。', NOW(), NOW()),
  ('sample', 'サンプル太郎', 'sample@example.com', 'salt:hash', 'サンプルのプロフィールページです。', NOW(), NOW());

-- デモリンク作成
INSERT INTO links (user_id, title, url, order_index, created_at, updated_at)
SELECT 
  u.id,
  data.title,
  data.url,
  data.order_index,
  NOW(),
  NOW()
FROM users u,
(VALUES
  ('demo', 'ポートフォリオ', 'https://example.com/portfolio', 0),
  ('demo', 'ブログ', 'https://example.com/blog', 1),
  ('demo', 'GitHub', 'https://github.com/example', 2),
  ('sample', 'ホームページ', 'https://sample.example.com', 0),
  ('sample', 'Twitter', 'https://twitter.com/sample', 1)
) AS data(user_name, title, url, order_index)
WHERE u.user_name = data.user_name;

-- デモSNSアカウント作成
INSERT INTO social_accounts (user_id, platform, url, created_at, updated_at)
SELECT 
  u.id,
  data.platform,
  data.url,
  NOW(),
  NOW()
FROM users u,
(VALUES
  ('demo', 'github', 'https://github.com/demo'),
  ('demo', 'x', 'https://twitter.com/demo'),
  ('sample', 'youtube', 'https://youtube.com/@sample'),
  ('sample', 'instagram', 'https://instagram.com/sample')
) AS data(user_name, platform, url)
WHERE u.user_name = data.user_name;