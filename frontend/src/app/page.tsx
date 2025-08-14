'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/Layout/Navbar';
import HomePage from '@/components/HomePage/HomePage';
import { apiClient, tokenManager } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (tokenManager.isAuthenticated()) {
      router.replace('/profile');
    }
  }, [router]);
  const handleDemoLogin = async () => {
    try {
      const res = await apiClient.login({ user_id: 'demo', password: 'test' });
      if (res.success && res.access_token) {
        // DEMO は自動ログインは残さない
        tokenManager.setToken(res.access_token, false);
        router.push('/profile');
      }
    } catch (e) {
      console.error('Demo login failed', e);
    }
  };

  return (
    <>
      <Navbar 
        isAuthenticated={false}
        onDemoLogin={handleDemoLogin}
      />
      <HomePage />
    </>
  );
}
