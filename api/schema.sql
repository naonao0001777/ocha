-- Ocha Profile Service Database Schema for Supabase
-- 移行手順書に基づくテーブル作成とRLS設定

-- Users テーブル
create table public.users (
  id uuid default gen_random_uuid() primary key,
  auth_uid uuid unique, -- supabase auth のユーザーIDを格納（将来の認証連携用）
  user_name text unique not null, -- プロフィールURL用のユーザー名 (/u/{user_name})
  name text not null, -- 表示名
  password_hash text not null, -- パスワードハッシュ（認証用）
  biography text, -- プロフィール文
  profile_image text, -- プロフィール画像のURL（Supabase Storage）
  is_deleted boolean not null default false, -- アカウント論理削除フラグ
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Links テーブル（ユーザーが追加するリンク）
create table public.links (
  id bigint generated always as identity primary key,
  user_id uuid references public.users(id) on delete cascade,
  title text not null, -- リンクのタイトル
  url text not null, -- リンクのURL
  order_index integer default 0, -- 表示順序
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Social Accounts テーブル（SNSアカウント）
create table public.social_accounts (
  id bigint generated always as identity primary key,
  user_id uuid references public.users(id) on delete cascade,
  platform text not null check (platform in ('youtube', 'x', 'twitch', 'github', 'instagram', 'facebook')),
  url text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- 1ユーザーにつき1プラットフォームのみ
  unique(user_id, platform)
);

-- インデックス作成
create index idx_users_user_name on public.users(user_name);
create index idx_users_auth_uid on public.users(auth_uid);
create index idx_links_user_id on public.links(user_id);
create index idx_links_order on public.links(user_id, order_index);
create index idx_social_accounts_user_id on public.social_accounts(user_id);

-- RLS (Row Level Security) 有効化
alter table public.users enable row level security;
alter table public.links enable row level security;
alter table public.social_accounts enable row level security;

-- RLS ポリシー設定

-- Users テーブル: 全員が読み取り可能、所有者のみ更新可能
create policy "users_select_public" on public.users
  for select using (true);

create policy "users_update_own" on public.users
  for update using (auth.uid() = auth_uid);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = auth_uid);

-- Links テーブル: 全員が読み取り可能、所有者のみ操作可能
create policy "links_select_public" on public.links
  for select using (true);

create policy "links_all_own" on public.links
  for all using (
    exists (
      select 1 from public.users 
      where users.id = links.user_id 
      and users.auth_uid = auth.uid()
    )
  );

-- Social Accounts テーブル: 全員が読み取り可能、所有者のみ操作可能
create policy "social_accounts_select_public" on public.social_accounts
  for select using (true);

create policy "social_accounts_all_own" on public.social_accounts
  for all using (
    exists (
      select 1 from public.users 
      where users.id = social_accounts.user_id 
      and users.auth_uid = auth.uid()
    )
  );

-- Updated_at 自動更新のためのトリガー関数
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Updated_at トリガー設定
create trigger handle_users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_links_updated_at
  before update on public.links
  for each row execute procedure public.handle_updated_at();

create trigger handle_social_accounts_updated_at
  before update on public.social_accounts
  for each row execute procedure public.handle_updated_at();

-- テストデータ挿入（開発用）
-- 注：実際のSupabaseでは認証なしでのINSERTを許可するため、一時的にRLSを無効にする必要があります

-- デモユーザー作成
insert into public.users (user_name, name, biography, created_at, updated_at) values
  ('demo', 'デモユーザー', 'これはデモプロフィールです。', now(), now()),
  ('sample', 'サンプル太郎', 'サンプルのプロフィールページです。', now(), now());

-- デモリンク作成
insert into public.links (user_id, title, url, order_index, created_at, updated_at)
select 
  u.id,
  data.title,
  data.url,
  data.order_index,
  now(),
  now()
from public.users u,
(values
  ('demo', 'ポートフォリオ', 'https://example.com/portfolio', 0),
  ('demo', 'ブログ', 'https://example.com/blog', 1),
  ('demo', 'GitHub', 'https://github.com/example', 2),
  ('sample', 'ホームページ', 'https://sample.example.com', 0),
  ('sample', 'Twitter', 'https://twitter.com/sample', 1)
) as data(user_name, title, url, order_index)
where u.user_name = data.user_name;

-- デモSNSアカウント作成
insert into public.social_accounts (user_id, platform, url, created_at, updated_at)
select 
  u.id,
  data.platform,
  data.url,
  now(),
  now()
from public.users u,
(values
  ('demo', 'github', 'https://github.com/demo'),
  ('demo', 'x', 'https://twitter.com/demo'),
  ('sample', 'youtube', 'https://youtube.com/@sample'),
  ('sample', 'instagram', 'https://instagram.com/sample')
) as data(user_name, platform, url)
where u.user_name = data.user_name;