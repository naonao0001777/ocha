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
import { useAuth } from '@/components/providers/AuthProvider';
import { ArrowLeft, UserPlus } from 'lucide-react';

const OchaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 512 512" className="inline ml-2">
    <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
  </svg>
);

export default function Register() {
  const { t, locale } = useLanguage();
  const { isAuthenticated, login, logout } = useAuth();
  const [step, setStep] = useState(1); // 1: メール入力, 2: 詳細情報入力
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

  const handleDemoLogin = async () => {
    try {
      console.log('[Register] Demo login initiated');
      const res = await apiClient.login({ email: 'demo@example.com', password: 'test' });
      if (res.success && res.access_token) {
        console.log('[Register] Demo login successful, setting token and redirecting');
        login(res.access_token, false);
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    if (!formData.email) {
      setMessage(locale === 'ja' ? 'メールアドレスを入力してください' : 'Please enter your email address');
      setIsLoading(false);
      return;
    }

    // メールアドレスの形式検証
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage(locale === 'ja' ? '有効なメールアドレスを入力してください' : 'Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    // メールアドレス重複チェック
    try {
      await apiClient.checkEmailAvailability(formData.email);
      // 重複がない場合、次のステップに進む
      setIsLoading(false);
      setStep(2);
      setMessage('');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400 && error.message.toLowerCase().includes('already in use')) {
          setMessage(locale === 'ja' ? 'そのメールアドレスは既に使用されています' : 'This email address is already in use');
        } else {
          setMessage(locale === 'ja' ? 'メールアドレスの確認中にエラーが発生しました' : 'Error occurred while checking email address');
        }
      } else {
        setMessage(locale === 'ja' ? 'ネットワークエラーが発生しました' : 'Network error occurred');
      }
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    if (formData.password !== formData.confirmPassword) {
      setMessage(t('passwordMismatch'));
      setIsLoading(false);
      return;
    }
    
    if (formData.password.length < 4) {
      setMessage(t('passwordTooShort'));
      setIsLoading(false);
      return;
    }
    
    try {
      // APIを呼び出してユーザー作成
      await apiClient.createUser({
        user_name: formData.userId,
        name: formData.userName,
        email: formData.email,
        password: formData.password,
        biography: ''
      });
      
      setMessage(locale === 'ja' ? 'アカウントを作成しました。自動的にログインします...' : 'Account created successfully. Logging you in...');
      
      // アカウント作成成功後、自動的にログインする
      try {
        const loginRes = await apiClient.login({ 
          email: formData.email, 
          password: formData.password 
        });
        
        if (loginRes.success && loginRes.access_token) {
          // ログイン成功：トークンを保存してプロフィール画面に遷移
          login(loginRes.access_token, false);
          setTimeout(() => {
            router.push('/profile');
          }, 1000);
        } else {
          // ログイン失敗の場合はログイン画面に遷移
          setMessage(locale === 'ja' ? 'アカウントは作成されましたが、自動ログインに失敗しました。ログイン画面に移動します。' : 'Account created but auto-login failed. Redirecting to login page.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } catch (loginError) {
        // ログインエラーの場合もログイン画面に遷移
        console.error('Auto login failed:', loginError);
        setMessage(locale === 'ja' ? 'アカウントは作成されましたが、自動ログインに失敗しました。ログイン画面に移動します。' : 'Account created but auto-login failed. Redirecting to login page.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
      
    } catch (error) {
      // コンソールエラーは開発時のみ表示
      if (process.env.NODE_ENV === 'development') {
        console.error('User creation error:', error);
      }
      
      if (error instanceof ApiError) {
        if (error.status === 400) {
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('username already exists') || errorMessage.includes('already taken')) {
            setMessage(t('usernameExists'));
          } else if (errorMessage.includes('email address is already in use') || errorMessage.includes('email') && errorMessage.includes('already')) {
            setMessage(t('emailExists'));
          } else {
            setMessage(t('registrationFailed'));
          }
        } else {
          setMessage(t('registrationFailed'));
        }
      } else {
        setMessage(t('networkError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  return (
    <>
      <Navbar 
        isAuthenticated={isAuthenticated}
        onDemoLogin={handleDemoLogin}
        onLogout={handleLogout}
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
                <Alert variant={message.includes('エラー') || message.includes('失敗') || message.includes('error') || message.includes('Error') ? 'destructive' : 'default'} className="mb-6">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              
              {/* ステップ1: メールアドレス入力 */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="text-8xl mb-6">✉️</div>
                    <h2 className="text-xl font-semibold">
                      {locale === 'ja' ? 'まずはメールアドレスを入力してください' : 'Enter your email address'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {locale === 'ja' ? '将来的には認証メールを送信予定です' : 'We will send you a verification email in the future'}
                    </p>
                  </div>
                  
                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        {locale === 'ja' ? 'メールアドレス' : 'Email Address'}
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
                        autoFocus
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? 
                        (locale === 'ja' ? '確認中...' : 'Checking...') : 
                        (locale === 'ja' ? '次へ' : 'Next')
                      }
                    </Button>
                  </form>
                </div>
              )}

              {/* ステップ2: 詳細情報入力 */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={handleBackToStep1}
                      className="p-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold flex items-center">
                        <UserPlus className="h-5 w-5 mr-2" />
                        {locale === 'ja' ? 'アカウント情報を入力' : 'Enter Account Information'}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {formData.email}
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleDetailsSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="userId" className="text-sm font-medium">
                        {locale === 'ja' ? 'ユーザーID' : 'User ID'}
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
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userName" className="text-sm font-medium">
                        {locale === 'ja' ? '表示名' : 'Display Name'}
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
                        {locale === 'ja' ? 'パスワード' : 'Password'}
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
                        {locale === 'ja' ? 'パスワード確認' : 'Confirm Password'}
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}