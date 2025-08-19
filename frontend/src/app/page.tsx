'use client';

import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import HomePage from '@/components/HomePage/HomePage';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, login, logout } = useAuth();

  const handleDemoLogin = async () => {
    try {
      console.log('[Home] Demo login initiated');
      const res = await apiClient.login({ email: 'demo@example.com', password: 'test' });
      if (res.success && res.access_token) {
        console.log('[Home] Demo login successful, setting token and redirecting');
        login(res.access_token, false);
        // 少し遅延を入れて認証状態が確実に更新されるのを待つ
        setTimeout(() => {
          router.push('/profile');
        }, 100);
      } else {
        console.error('Demo login failed: Invalid response', res);
        alert('デモログインに失敗しました');
      }
    } catch (e) {
      console.error('Demo login failed', e);
      alert('デモログインに失敗しました');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <Navbar 
        isAuthenticated={isAuthenticated}
        onDemoLogin={handleDemoLogin}
        onLogout={handleLogout}
      />
      <HomePage />
    </>
  );
}
