'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface UserProfileViewProps {
  profile: UserProfile;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ profile }) => {
  const { user, links, social_accounts } = profile;

  const getSocialIcon = (platform: string) => {
    const iconMap: { [key: string]: string } = {
      youtube: '/assets/youtube_icon.png',
      x: '/assets/icon_x.png',
      twitch: '/assets/twitch_icon.png',
      github: '/assets/github_icon.png',
      instagram: '/assets/instagram_icon.png',
      facebook: '/assets/facebook_icon.png',
    };
    return iconMap[platform] || '/assets/web_icon.png';
  };

  const handleLinkClick = (url: string) => {
    // 外部リンクを新しいタブで開く
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative min-h-screen">
      {/* Background: Beautiful tea field landscape */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Tea field inspired gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 dark:from-green-800 dark:via-emerald-900 dark:to-green-900" />
        
        {/* Layered mountain hills effect */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-green-600 to-transparent opacity-80" />
          <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-green-700 to-transparent opacity-60" />
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-green-800 to-transparent opacity-40" />
        </div>
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-white to-transparent mix-blend-overlay" />
        
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-transparent to-transparent dark:from-blue-900 dark:via-transparent dark:to-transparent opacity-60" />
        
        {/* Content readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-transparent dark:from-black/30 dark:via-black/20 dark:to-transparent" />
      </div>
      {/* ナビゲーション */}
      <nav className="border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-neutral-900/20 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center text-xl font-bold text-foreground hover:text-primary transition-colors">
              Ocha
              <svg xmlns="http://www.w3.org/2000/svg" height="1.2em" viewBox="0 0 512 512" className="inline ml-1">
                <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8 max-w-md">
        {/* プロフィール画像 */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {user.profile_image ? (
              <Image
                src={user.profile_image}
                alt={`${user.name}のプロフィール画像`}
                width={100}
                height={100}
                className="rounded-full object-cover"
              />
            ) : (
              <Image
                src="/assets/default_leaf.png"
                alt="デフォルトプロフィール画像"
                width={100}
                height={100}
                className="rounded-full"
              />
            )}
          </div>
        </div>

        {/* ユーザー名 */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
          <p className="text-muted-foreground">@{user.user_name}</p>
        </div>

        {/* プロフィール文 */}
        {user.biography && (
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">{user.biography}</p>
          </div>
        )}

        {/* SNSアイコン */}
        {social_accounts.length > 0 && (
          <div className="flex justify-center space-x-4 mb-8">
            {social_accounts.map((account) => (
              <a
                key={account.id}
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full p-1 hover:bg-accent transition-colors"
              >
                <Image
                  src={getSocialIcon(account.platform)}
                  alt={account.platform}
                  width={35}
                  height={35}
                  className="rounded-full"
                />
              </a>
            ))}
          </div>
        )}

        {/* リンク一覧 */}
        <div className="space-y-3">
          {links.map((link) => (
            <Button
              key={link.id}
              variant="outline"
              className="w-full py-6 text-lg justify-between group border-white/20 dark:border-white/10 bg-white/30 dark:bg-neutral-900/20 backdrop-blur-lg hover:bg-white/40 dark:hover:bg-neutral-900/30 shadow-lg"
              onClick={() => handleLinkClick(link.url)}
            >
              <span className="truncate">{link.title}</span>
              <ExternalLink className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </Button>
          ))}
        </div>

        {/* リンクがない場合 */}
        {links.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">まだリンクがありません</p>
          </div>
        )}

        {/* フッター */}
        <footer className="text-center mt-12 pt-8 border-t">
          <p className="text-xs text-muted-foreground">
            Created with{' '}
            <Link href="/" className="hover:text-primary transition-colors">
              Ocha
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default UserProfileView;