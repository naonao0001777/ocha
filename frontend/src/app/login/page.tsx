'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import LoginPage from '@/components/LoginPage/LoginPage';
import { apiClient, ApiError, tokenManager } from '@/lib/api';

export default function Login() {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const router = useRouter();

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
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
        
      } else {
        setMessage('ログインに失敗しました');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessageType('error');
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setMessage('ユーザーIDまたはパスワードが間違っています');
        } else {
          setMessage('ログインに失敗しました');
        }
      } else {
        setMessage('ネットワークエラーが発生しました');
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