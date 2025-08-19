'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tokenManager } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean | undefined;
  userId: string | null;
  login: (token: string, remember?: boolean) => void;
  logout: () => void;
  checkAuth: () => void;
  forceLogoutAllSessions: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 初期状態をundefinedにして、認証状態のチェックが完了するまで待機
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
  const [userId, setUserId] = useState<string | null>(null);
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);

  const checkAuth = () => {
    const authStatus = tokenManager.isAuthenticated();
    const currentUserId = tokenManager.getCurrentUserId();
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthProvider] checkAuth:', { authStatus, currentUserId });
    }
    setIsAuthenticated(authStatus);
    setUserId(currentUserId);
  };

  const login = (token: string, remember: boolean = false) => {
    console.log('[AuthProvider] login called with token:', token.substring(0, 20) + '...');
    
    // 新規ログイン時に既存のセッションを完全にクリア
    console.log('[AuthProvider] Clearing existing sessions before new login');
    tokenManager.removeToken();
    sessionStorage.clear();
    localStorage.removeItem('access_token');
    localStorage.removeItem('remember_me');
    
    // 新しいトークンを設定
    tokenManager.setToken(token, remember);
    checkAuth();
    
    // 他のタブにログインを通知（既存セッションを無効化）
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'login', forceLogout: true });
    }
  };

  const logout = () => {
    console.log('[AuthProvider] Performing complete logout');
    
    // 完全なセッションクリア
    tokenManager.removeToken();
    sessionStorage.clear();
    localStorage.removeItem('access_token');
    localStorage.removeItem('remember_me');
    
    // 認証状態をクリア
    setIsAuthenticated(false);
    setUserId(null);
    
    // 他のタブにログアウトを通知
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'logout' });
    }
  };

  const forceLogoutAllSessions = () => {
    console.log('[AuthProvider] Force logout all sessions');
    logout();
    // 全てのタブに強制ログアウトを通知
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'logout', force: true });
    }
  };

  // 初期化時とストレージ変更時に認証状態をチェック
  useEffect(() => {
    checkAuth();

    // BroadcastChannelを作成してタブ間通信を設定
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('auth_channel');
      setBroadcastChannel(channel);

      // 他のタブからのメッセージを監視
      const handleBroadcastMessage = (event: MessageEvent) => {
        console.log('[AuthProvider] Received broadcast message:', event.data);
        if (event.data.type === 'logout') {
          // 他のタブでログアウトされた場合、このタブでも認証状態をクリア
          console.log('[AuthProvider] Force logout from other tab');
          tokenManager.removeToken();
          sessionStorage.clear();
          localStorage.removeItem('access_token');
          localStorage.removeItem('remember_me');
          setIsAuthenticated(false);
          setUserId(null);
        } else if (event.data.type === 'login') {
          if (event.data.forceLogout) {
            // 他のタブで新規ログインされた場合、このタブのセッションを無効化
            console.log('[AuthProvider] New login detected, clearing current session');
            tokenManager.removeToken();
            sessionStorage.clear();
            localStorage.removeItem('access_token');
            localStorage.removeItem('remember_me');
            setIsAuthenticated(false);
            setUserId(null);
          } else {
            // 通常のログイン通知の場合、認証状態を再チェック
            checkAuth();
          }
        }
      };

      channel.addEventListener('message', handleBroadcastMessage);

      // クリーンアップ関数にchannelのcloseを追加
      return () => {
        channel.removeEventListener('message', handleBroadcastMessage);
        channel.close();
      };
    }

    // ストレージの変更を監視（他のタブでのログイン/ログアウトを検知）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === null) {
        console.log('[AuthProvider] Storage change detected:', e.key);
        checkAuth();
      }
    };

    // ページフォーカス時にも認証状態をチェック
    const handleFocus = () => {
      console.log('[AuthProvider] Page focused, checking auth');
      checkAuth();
    };

    if (typeof window !== 'undefined') {
      const globalWindow = window as Window & typeof globalThis;
      globalWindow.addEventListener('storage', handleStorageChange);
      globalWindow.addEventListener('focus', handleFocus);
      
      return () => {
        globalWindow.removeEventListener('storage', handleStorageChange);
        globalWindow.removeEventListener('focus', handleFocus);
      };
    }
    
    return () => {};
  }, []);

  const value = {
    isAuthenticated,
    userId,
    login,
    logout,
    checkAuth,
    forceLogoutAllSessions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};