'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import AdminPage from '@/components/AdminPage/AdminPage';
import { apiClient, ApiError, tokenManager, CreateSocialAccountRequest } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminUserProfile {
  userId: string;
  userName: string;
  biography: string;
  profileImage?: string;
  socialAccounts: {
    youtube?: string;
    x?: string;
    twitch?: string;
    github?: string;
    instagram?: string;
    facebook?: string;
  };
  links: { id: number; title: string; url: string }[];
}

export default function ProfileAdmin() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<AdminUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenManager.isAuthenticated()) {
      router.push('/login');
      return;
    }
    const userId = tokenManager.getCurrentUserId();
    if (!userId) {
      router.push('/login');
      return;
    }
    setCurrentUserId(userId);
    loadUserProfile(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadUserProfile = async (userId?: string) => {
    try {
      setLoading(true);
      const userIdToUse = userId || currentUserId;
      if (!userIdToUse) return;
      const profile = await apiClient.getUserProfile(userIdToUse);
      const adminProfile: AdminUserProfile = {
        userId: profile.user.user_name,
        userName: profile.user.name,
        biography: profile.user.biography || '',
        profileImage: profile.user.profile_image,
        socialAccounts: profile.social_accounts.reduce((acc, account) => {
          acc[account.platform as keyof AdminUserProfile['socialAccounts']] = account.url;
          return acc;
        }, {} as AdminUserProfile['socialAccounts']),
        links: profile.links.map(link => ({ id: link.id, title: link.title, url: link.url }))
      };
      setUserProfile(adminProfile);
      // メッセージはここでは消さない（直前のCRUD完了メッセージを維持）
    } catch (err) {
      console.error('Failed to load user profile:', err);
      if (err instanceof ApiError && err.status === 404) {
        setError('ユーザーが見つかりません。まずはプロフィールを作成してください。');
      } else {
        setError('プロフィールの読み込みに失敗しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    tokenManager.removeToken();
    sessionStorage.clear();
    router.push('/');
  };

  const handleProfileImageUpload = async (file: File) => {
    try {
      setMessage('画像をアップロード中...');
      const hadImage = !!userProfile?.profileImage;
      const fileKey = await apiClient.uploadFile(file);
      const normalizedKey = fileKey.replace(/^\/+/, '').replace(/^(uploads\/+)+/, 'uploads/');
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'ocha-serverless-storage-bucket';
      const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
      const imageUrl = `${baseUrl}/storage/v1/object/public/${bucketName}/${normalizedKey}`;
      if (!currentUserId) throw new Error('User not authenticated');
      await apiClient.updateUserProfile(currentUserId, { profile_image: imageUrl });
      setMessage(hadImage ? 'プロフィール画像を変更しました' : 'プロフィール画像をアップロードしました');
      await loadUserProfile();
    } catch (err) {
      console.error('Profile image upload failed:', err);
      setError('プロフィール画像のアップロードに失敗しました');
    }
  };

  const handleProfileImageDelete = async () => {
    try {
      console.log('[Profile] handleProfileImageDelete: start');
       setMessage('プロフィール画像を削除中...');
       if (!currentUserId) throw new Error('User not authenticated');
       // 先にストレージから削除
       if (userProfile?.profileImage) {
        console.log('[Profile] deleting from storage:', userProfile.profileImage);
        await apiClient.deleteFileByUrl(userProfile.profileImage);
        console.log('[Profile] storage delete: done');
       }
      console.log('[Profile] calling API: updateUserProfile -> profile_image: null');
      await apiClient.updateUserProfile(currentUserId, { profile_image: null });
      console.log('[Profile] API updateUserProfile: done');
       setMessage('プロフィール画像を削除しました');
      await loadUserProfile();
      console.log('[Profile] loadUserProfile: done');
     } catch (err) {
       console.error('Profile image delete failed:', err);
       setError('プロフィール画像の削除に失敗しました');
     }
  };

  const handleSocialAccountUpdate = async (accounts: AdminUserProfile['socialAccounts']) => {
    try {
      setMessage('SNSアカウントを更新中...');
      for (const [platform, url] of Object.entries(accounts)) {
        if (url && url.trim()) {
          try {
            if (!currentUserId) throw new Error('User not authenticated');
            await apiClient.createSocialAccount(currentUserId, {
              platform: platform as CreateSocialAccountRequest['platform'],
              url: url.trim(),
            });
          } catch (err) {
            console.warn(`Social account creation failed for ${platform}:`, err);
          }
        }
      }
      setMessage('SNSアカウントを更新しました');
      await loadUserProfile();
    } catch (err) {
      console.error('Social account update failed:', err);
      setError('SNSアカウントの更新に失敗しました');
    }
  };

  const handleLinkAdd = async (title: string, url: string) => {
    try {
      setMessage('リンクを追加中...');
      if (!currentUserId) throw new Error('User not authenticated');
      await apiClient.createLink(currentUserId, { title, url });
      setMessage('リンクを追加しました');
      await loadUserProfile();
    } catch (err) {
      console.error('Link creation failed:', err);
      setError('リンクの追加に失敗しました');
    }
  };

  const handleLinkUpdate = async (linkId: number, title: string, url: string) => {
    try {
      setMessage('リンクを更新中...');
      if (!currentUserId) throw new Error('User not authenticated');
      await apiClient.updateLink(currentUserId, linkId, { title, url });
      setMessage('リンクを更新しました');
      await loadUserProfile();
    } catch (err) {
      console.error('Link update failed:', err);
      setError('リンクの更新に失敗しました');
    }
  };

  const handleLinkDelete = async (linkId: number) => {
    try {
      setMessage('リンクを削除中...');
      if (!currentUserId) throw new Error('User not authenticated');
      await apiClient.deleteLink(currentUserId, linkId);
      setMessage('リンクを削除しました');
      await loadUserProfile();
    } catch (err) {
      console.error('Link delete failed:', err);
      setError('リンクの削除に失敗しました');
    }
  };

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>プロフィールを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Alert className="mb-4">
            <AlertDescription className="text-foreground">{error}</AlertDescription>
          </Alert>
          <button
            onClick={() => loadUserProfile()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar 
        isAuthenticated={true}
        onLogout={handleLogout}
      />
      {userProfile && (
        <AdminPage
           userProfile={userProfile}
           message={message}
           onProfileImageUpload={handleProfileImageUpload}
           onProfileImageDelete={handleProfileImageDelete}
           onSocialAccountUpdate={handleSocialAccountUpdate}
           onLinkAdd={handleLinkAdd}
           onLinkUpdate={handleLinkUpdate}
           onLinkDelete={handleLinkDelete}
         />
      )}
    </>
  );
}
