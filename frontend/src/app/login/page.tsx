'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import LoginPage from '@/components/LoginPage/LoginPage';
import { apiClient, ApiError, tokenManager } from '@/lib/api';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function Login() {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogin = async (userId: string, password: string, autoLogin: boolean) => {
    try {
      setMessage('');
      const response = await apiClient.login({ user_id: userId, password });
      
      if (response.success) {
        // ログイン成功
        console.log('Login successful:', response);
        
        // JWTトークンを保存
        tokenManager.setToken(response.access_token, !!autoLogin);
        
        setMessage(response.message);
        setMessageType('success');
        
        // プロフィール管理画面にリダイレクト
        // window.location.href を使用してハードリダイレクト
        setTimeout(() => {
          window.location.href = '/profile';
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
    // デモログイン（demo/test）
    await handleLogin('demo', 'test', false);
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