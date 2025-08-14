import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apiClient, UserProfile } from '@/lib/api';
import UserProfileView from '@/components/UserProfile/UserProfileView';

interface PageProps {
  params: Promise<{ userId: string }>;
}

// ユーザープロフィール取得（Server-side）
async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
    const url = `${API_BASE}/users/${userId}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Server-side で強制的に最新データを取得
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const profile: UserProfile = await response.json();
    return profile;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

// メタデータ生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;
  const profile = await getUserProfile(userId);
  
  if (!profile) {
    return {
      title: 'User Not Found - Ocha',
    };
  }

  const { user } = profile;
  
  return {
    title: `${user.name} (@${user.user_name}) - Ocha`,
    description: user.biography || `${user.name}のプロフィールページです`,
    openGraph: {
      title: `${user.name} (@${user.user_name})`,
      description: user.biography || `${user.name}のプロフィールページです`,
      url: `https://ocha.onrender.com/u/${user.user_name}`,
      siteName: 'Ocha',
      type: 'profile',
      images: user.profile_image ? [
        {
          url: user.profile_image,
          width: 400,
          height: 400,
          alt: `${user.name}のプロフィール画像`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary',
      title: `${user.name} (@${user.user_name})`,
      description: user.biography || `${user.name}のプロフィールページです`,
      images: user.profile_image ? [user.profile_image] : [],
    },
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const profile = await getUserProfile(userId);

  if (!profile) {
    notFound();
  }

  return <UserProfileView profile={profile} />;
}

// 静的生成の設定（必要に応じて）
export const revalidate = 3600; // 1時間でリバリデート