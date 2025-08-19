'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import AdminPage from '@/components/AdminPage/AdminPage';
import { apiClient, ApiError, CreateSocialAccountRequest } from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
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
  const { isAuthenticated, userId: authUserId, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<AdminUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('[Profile] useEffect - Auth state:', { isAuthenticated, authUserId });
    
    // 認証状態がまだ確定していない場合は待機
    if (isAuthenticated === undefined) {
      console.log('[Profile] Authentication state not yet determined, waiting...');
      return;
    }
    
    if (!isAuthenticated || !authUserId) {
      console.log('[Profile] Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    console.log('[Profile] Loading user profile for:', authUserId);
    if (authUserId) loadUserProfile(authUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authUserId, router]);

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      if (!userId) return;
      const profile = await apiClient.getUserProfile(userId);
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
    logout();
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
      if (!authUserId) throw new Error('User not authenticated');
      await apiClient.updateUserProfile(authUserId, { profile_image: imageUrl });
      setMessage(hadImage ? 'プロフィール画像を変更しました' : 'プロフィール画像をアップロードしました');
      if (authUserId) await loadUserProfile(authUserId);
    } catch (err) {
      console.error('Profile image upload failed:', err);
      setError('プロフィール画像のアップロードに失敗しました');
    }
  };

  const handleProfileImageDelete = async () => {
    try {
      console.log('[Profile] handleProfileImageDelete: start');
       setMessage('プロフィール画像を削除中...');
       if (!authUserId) throw new Error('User not authenticated');
       // 先にストレージから削除
       if (userProfile?.profileImage) {
        console.log('[Profile] deleting from storage:', userProfile.profileImage);
        await apiClient.deleteFileByUrl(userProfile.profileImage);
        console.log('[Profile] storage delete: done');
       }
      console.log('[Profile] calling API: updateUserProfile -> profile_image: null');
      await apiClient.updateUserProfile(authUserId, { profile_image: null });
      console.log('[Profile] API updateUserProfile: done');
       setMessage('プロフィール画像を削除しました');
      if (authUserId) await loadUserProfile(authUserId);
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
            if (!authUserId) throw new Error('User not authenticated');
            await apiClient.createSocialAccount(authUserId, {
              platform: platform as CreateSocialAccountRequest['platform'],
              url: url.trim(),
            });
          } catch (err) {
            console.warn(`Social account creation failed for ${platform}:`, err);
          }
        }
      }
      setMessage('SNSアカウントを更新しました');
      if (authUserId) await loadUserProfile(authUserId);
    } catch (err) {
      console.error('Social account update failed:', err);
      setError('SNSアカウントの更新に失敗しました');
    }
  };

  const handleSocialAccountDelete = async (platform: keyof AdminUserProfile['socialAccounts']) => {
    try {
      setMessage('SNSアカウントを削除中...');
      if (!authUserId) throw new Error('User not authenticated');
      
      // プロフィールから該当プラットフォームのソーシャルアカウントIDを取得
      const profile = await apiClient.getUserProfile(authUserId);
      const socialAccount = profile.social_accounts.find(acc => acc.platform === platform);
      
      if (socialAccount) {
        await apiClient.deleteSocialAccount(authUserId, socialAccount.id);
        setMessage('SNSアカウントを削除しました');
        if (authUserId) await loadUserProfile(authUserId);
      } else {
        setError('削除対象のSNSアカウントが見つかりません');
      }
    } catch (err) {
      console.error('Social account delete failed:', err);
      setError('SNSアカウントの削除に失敗しました');
    }
  };

  const handleLinkAdd = async (title: string, url: string) => {
    try {
      setMessage('リンクを追加中...');
      if (!authUserId) throw new Error('User not authenticated');
      await apiClient.createLink(authUserId, { title, url });
      setMessage('リンクを追加しました');
      if (authUserId) await loadUserProfile(authUserId);
    } catch (err) {
      console.error('Link creation failed:', err);
      setError('リンクの追加に失敗しました');
    }
  };

  const handleLinkUpdate = async (linkId: number, title: string, url: string) => {
    try {
      setMessage('リンクを更新中...');
      if (!authUserId) throw new Error('User not authenticated');
      await apiClient.updateLink(authUserId, linkId, { title, url });
      setMessage('リンクを更新しました');
      if (authUserId) await loadUserProfile(authUserId);
    } catch (err) {
      console.error('Link update failed:', err);
      setError('リンクの更新に失敗しました');
    }
  };

  const handleLinkDelete = async (linkId: number) => {
    try {
      setMessage('リンクを削除中...');
      if (!authUserId) throw new Error('User not authenticated');
      await apiClient.deleteLink(authUserId, linkId);
      setMessage('リンクを削除しました');
      if (authUserId) await loadUserProfile(authUserId);
    } catch (err) {
      console.error('Link delete failed:', err);
      setError('リンクの削除に失敗しました');
    }
  };

  // 認証状態が確定していない場合のローディング
  if (isAuthenticated === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>認証状態を確認中...</p>
        </div>
      </div>
    );
  }

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
            onClick={() => authUserId && loadUserProfile(authUserId)}
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
           onSocialAccountDelete={handleSocialAccountDelete}
           onLinkAdd={handleLinkAdd}
           onLinkUpdate={handleLinkUpdate}
           onLinkDelete={handleLinkDelete}
         />
      )}
    </>
  );
}
