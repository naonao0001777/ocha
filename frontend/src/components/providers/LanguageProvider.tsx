'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'ja' | 'en';

type Dict = Record<string, string>;

const ja: Dict = {
  // Navbar
  signIn: 'ログイン',
  signUp: '新規登録',
  editProfile: 'プロフィール編集',
  logout: 'ログアウト',
  // Home
  heroDescription: 'Ochaは自己紹介文やURLをまとめて公開できるプロフィールジェネレーターサイトです。',
  getStarted: 'はじめる',
  features1Title: '最大10個まで',
  features1Desc: 'リンクを追加することができるのは最大10個までです。',
  features2Title: 'プロフィール画像を追加',
  features2Desc: 'png,jpeg形式の画像をプロフィール画像として使用できます。もちろん使用しなくてもデフォルトのアイコンが当てられます。',
  features3Title: 'アカウントを作成',
  features3Desc: 'アカウントを作成していただきますが、もちろん削除してもう一度再利用することができます。',
  privacy: 'プライバシーポリシー',
  terms: '規約',
  authorInfo: '当サイト制作者の情報',
  // Auth
  autoLogin: '次回から自動でログイン',
  signingIn: 'サインイン中...',
  creatingAccount: 'アカウント作成中...',
};

const en: Dict = {
  // Navbar
  signIn: 'Sign In',
  signUp: 'Sign Up',
  editProfile: 'Edit profile',
  logout: 'Logout',
  // Home
  heroDescription: 'Ocha is a profile service that lets you collect and add links to your profile.',
  getStarted: 'Get started',
  features1Title: 'Up to 10 links',
  features1Desc: 'You can add up to 10 links to your profile.',
  features2Title: 'Add a profile image',
  features2Desc: 'You can use png or jpeg images as your profile icon. A default icon is used if none is set.',
  features3Title: 'Create an account',
  features3Desc: 'You can create an account and delete it anytime to reuse the service again.',
  privacy: 'Privacy Policy',
  terms: 'Terms',
  authorInfo: 'About the creator',
  // Auth
  autoLogin: 'Keep me signed in',
  signingIn: 'Signing in...',
  creatingAccount: 'Creating account...',
};

const DICTS: Record<Locale, Dict> = { ja, en };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('ja');

  // 初期化: localStorage or ブラウザ言語
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('locale') as Locale | null) : null;
    if (stored === 'ja' || stored === 'en') {
      setLocale(stored);
      return;
    }
    const nav = typeof navigator !== 'undefined' ? navigator.language : 'ja';
    setLocale(nav.toLowerCase().startsWith('ja') ? 'ja' : 'en');
  }, []);

  // 変更時の永続化と <html lang> 反映
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
      try {
        document.documentElement.lang = locale;
      } catch {
        // no-op
      }
    }
  }, [locale]);

  const t = useMemo(() => {
    const dict = DICTS[locale] ?? ja;
    return (key: string) => dict[key] ?? key;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
