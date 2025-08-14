'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Layout/Navbar';
import { apiClient, ApiError } from '@/lib/api';
import { useLanguage } from '@/components/providers/LanguageProvider';

const OchaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 512 512" className="inline ml-2">
    <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
  </svg>
);

export default function Register() {
  const { t, locale } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    userId: '',
    userName: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDemoLogin = () => {
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    if (formData.password !== formData.confirmPassword) {
      setMessage(locale === 'ja' ? 'パスワードが一致しません' : 'Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (formData.password.length < 4) {
      setMessage(locale === 'ja' ? 'パスワードは4文字以上で入力してください' : 'Password must be at least 4 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      // APIを呼び出してユーザー作成
      await apiClient.createUser({
        user_name: formData.userId,
        name: formData.userName,
        password: formData.password,
        biography: ''
      });
      
      setMessage(locale === 'ja' ? 'アカウントが作成されました！ログイン画面に移動します...' : 'Account created! Redirecting to sign in...');
      
      // 2秒後にログイン画面にリダイレクト
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      console.error('User creation error:', error);
      if (error instanceof ApiError) {
        if (error.status === 400) {
          setMessage(locale === 'ja' ? 'このユーザーIDは既に使用されています' : 'This user ID is already taken');
        } else {
          setMessage(locale === 'ja' ? 'アカウントの作成に失敗しました' : 'Failed to create account');
        }
      } else {
        setMessage(locale === 'ja' ? 'ネットワークエラーが発生しました' : 'A network error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Navbar 
        isAuthenticated={false}
        onDemoLogin={handleDemoLogin}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-lg shadow-2xl border-muted">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold flex items-center justify-center">
                {locale === 'ja' ? 'サインアップ' : 'Sign Up'}
                <OchaIcon />
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {message && (
                <Alert variant={message.includes('エラー') || message.includes('失敗') ? 'destructive' : 'default'} className="mb-6">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userId" className="text-sm font-medium">
                    User ID
                  </Label>
                  <Input
                    id="userId"
                    name="userId"
                    type="text"
                    placeholder={locale === 'ja' ? 'ユーザーIDを入力' : 'Enter user ID'}
                    value={formData.userId}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userName" className="text-sm font-medium">
                    User Name
                  </Label>
                  <Input
                    id="userName"
                    name="userName"
                    type="text"
                    placeholder={locale === 'ja' ? '表示名を入力' : 'Enter display name'}
                    value={formData.userName}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={locale === 'ja' ? 'パスワードを入力' : 'Enter password'}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder={locale === 'ja' ? 'パスワードを再入力' : 'Re-enter password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    className="w-full"
                  />
                </div>


                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? t('creatingAccount') : t('signUp')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}