'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import LoginPage from '@/components/LoginPage/LoginPage';
import { apiClient, ApiError } from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function Login() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const { t } = useLanguage();
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string, autoLogin: boolean) => {
    try {
      setMessage('');
      const response = await apiClient.login({ email, password });
      
      if (response.success) {
        // ログイン成功
        console.log('[Login] Login successful:', response);
        
        // JWTトークンを保存
        console.log('[Login] Calling login with token:', response.access_token.substring(0, 20) + '...');
        login(response.access_token, !!autoLogin);
        
        setMessage(response.message);
        setMessageType('success');
        
        // プロフィール管理画面にリダイレクト
        console.log('[Login] Redirecting to profile page');
        setTimeout(() => {
          router.push('/profile');
        }, 1000);
        
      } else {
        setMessage(t('loginFailed'));
        setMessageType('error');
      }
    } catch (error) {
      // コンソールエラーは開発時のみ表示
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      
      setMessageType('error');
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setMessage(t('invalidCredentials'));
        } else if (error.status === 404) {
          setMessage(t('accountNotExists'));
        } else {
          setMessage(t('loginFailed'));
        }
      } else {
        setMessage(t('networkError'));
      }
    }
  };

  const handleDemoLogin = async () => {
    // デモログイン（demo@example.com/test）
    console.log('[Login] Demo login initiated');
    await handleLogin('demo@example.com', 'test', false);
  };

  return (
    <>
      <Navbar 
        isAuthenticated={false}
        onDemoLogin={handleDemoLogin}
      />
      <LoginPage onLogin={handleLogin} message={message} messageType={messageType} />
    </>
  );
}