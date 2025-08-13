'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const OchaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 512 512" className="inline ml-2">
    <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
  </svg>
);

interface LoginPageProps {
  message?: string;
  onLogin?: (userId: string, password: string, autoLogin: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ message, onLogin }) => {
  const [formData, setFormData] = useState({
    userId: '',
    userPassword: '',
    autoLogin: false
  });
  
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // CSRF token generation (client-side for demo purposes)
    const generateToken = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    };
    setToken(generateToken());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (onLogin) {
        await onLogin(formData.userId, formData.userPassword, formData.autoLogin);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      autoLogin: checked
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md shadow-2xl border-muted">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-bold flex items-center justify-center">
              サインイン
              <OchaIcon />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {message && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-sm font-medium">
                  User ID
                </Label>
                <Input
                  id="userId"
                  name="userId"
                  type="text"
                  placeholder="ユーザーIDを入力"
                  value={formData.userId}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userPassword" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="userPassword"
                  name="userPassword"
                  type="password"
                  placeholder="パスワードを入力"
                  value={formData.userPassword}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoLogin"
                  checked={formData.autoLogin}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label 
                  htmlFor="autoLogin" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  次回から自動でログイン
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'サインイン中...' : 'Sign in'}
              </Button>
              
              <input type="hidden" name="token" value={token} />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;