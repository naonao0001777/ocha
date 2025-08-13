'use client';

import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import AdminPage from '@/components/AdminPage/AdminPage';

// サンプルデータ（実際の実装ではAPIから取得）
const sampleUserProfile = {
  userId: 'naohiro',
  userName: '山田太郎',
  biography: 'プログラマー・デザイナー',
  profileImage: '/assets/default_leaf.png',
  socialAccounts: {
    youtube: 'https://youtube.com/@sample',
    x: 'https://twitter.com/sample',
    github: 'https://github.com/sample',
  },
  links: [
    { id: 1, title: 'ポートフォリオ', url: 'https://example.com/portfolio' },
    { id: 2, title: 'ブログ', url: 'https://example.com/blog' },
    { id: 3, title: '作品集', url: 'https://example.com/works' },
  ]
};

export default function Admin() {
  const handleLogout = () => {
    console.log('Logout clicked');
    // ログアウト処理を実装
  };

  const handleProfileImageUpload = (file: File) => {
    console.log('Profile image upload:', file);
    // ファイルアップロード処理を実装
  };

  const handleProfileImageDelete = () => {
    console.log('Profile image delete');
    // プロフィール画像削除処理を実装
  };

  const handleSocialAccountUpdate = (accounts: any) => {
    console.log('Social account update:', accounts);
    // SNSアカウント更新処理を実装
  };

  const handleLinkAdd = (title: string, url: string) => {
    console.log('Link add:', { title, url });
    // リンク追加処理を実装
  };

  const handleLinkUpdate = (linkId: number, title: string, url: string) => {
    console.log('Link update:', { linkId, title, url });
    // リンク更新処理を実装
  };

  const handleLinkDelete = (linkId: number) => {
    console.log('Link delete:', linkId);
    // リンク削除処理を実装
  };

  return (
    <>
      <Navbar 
        isAuthenticated={true}
        onLogout={handleLogout}
      />
      <AdminPage
        userProfile={sampleUserProfile}
        message="ログインしました！"
        onProfileImageUpload={handleProfileImageUpload}
        onProfileImageDelete={handleProfileImageDelete}
        onSocialAccountUpdate={handleSocialAccountUpdate}
        onLinkAdd={handleLinkAdd}
        onLinkUpdate={handleLinkUpdate}
        onLinkDelete={handleLinkDelete}
      />
    </>
  );
}