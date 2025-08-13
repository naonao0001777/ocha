'use client';

import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import LoginPage from '@/components/LoginPage/LoginPage';

export default function Login() {
  const handleLogin = (userId: string, password: string, autoLogin: boolean) => {
    // ログイン処理をここに実装
    console.log('Login attempt:', { userId, password, autoLogin });
    // 実際の実装では、APIを呼び出してログイン処理を行う
  };

  const handleDemoLogin = () => {
    // デモログインの処理
    console.log('Demo login clicked');
  };

  return (
    <>
      <Navbar 
        isAuthenticated={false}
        onDemoLogin={handleDemoLogin}
      />
      <LoginPage onLogin={handleLogin} />
    </>
  );
}