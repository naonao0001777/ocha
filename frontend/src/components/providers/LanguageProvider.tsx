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
  heroDescription: 'あなたの個性を一つのページに。Ochaで魅力的なプロフィールページを作成し、大切なリンクやコンテンツを美しくまとめて世界に発信しよう。',
  getStarted: 'はじめる',
  features1Title: '洗練と余白のデザイン',
  features1Desc: '10個までのリンクを、美しい余白と整ったタイポグラフィで端正にレイアウト。緑の洗練されたデザインで、訪問者に印象を与えます。',
  features2Title: 'オリジナル画像でブランディング',
  features2Desc: 'あなただけのプロフィール画像をアップロード。PNG・JPEG形式に対応し、個性を表現できます。設定しない場合も洗練されたデフォルトアイコンをご利用いただけます。',
  features3Title: 'ミニマルで迷わせない設計',
  features3Desc: '必要な情報だけを美しく整理。ノイズを排したシンプルなUIで、訪問者を迷わせません。',
  privacy: 'プライバシーポリシー',
  terms: '規約',
  authorInfo: '当サイト制作者の情報',
  // Auth
  autoLogin: '次回から自動でログイン',
  signingIn: 'サインイン中...',
  creatingAccount: 'アカウント作成中...',
  // Profile Edit
  profileEditTitle: 'プロフィール編集',
  basicInfo: '基本情報',
  displayName: '表示名',
  displayNamePlaceholder: 'あなたの名前',
  biography: '自己紹介',
  biographyPlaceholder: 'あなたについて教えてください...',
  saveBasicInfo: '基本情報を保存',
  saving: '保存中...',
  linksManagement: 'リンク管理',
  addNewLink: '新しいリンクを追加',
  linkTitlePlaceholder: '表示名（例：ブログ、ポートフォリオ）',
  linkUrlPlaceholder: 'URL（例：example.com）',
  addLink: 'リンクを追加',
  currentLinks: '現在のリンク',
  noLinksYet: 'まだリンクがありません',
  snsManagement: 'SNSアカウント管理',
  platform: 'プラットフォーム',
  snsUrlPlaceholder: 'プロフィールURL（例：github.com/username）',
  addSns: 'SNS追加',
  registeredSns: '登録済みSNSアカウント',
  noSnsYet: 'まだSNSアカウントがありません',
  viewProfile: 'プロフィールを表示',
  linkAdded: 'リンクを追加しました',
  linkDeleted: 'リンクを削除しました',
  snsAdded: 'SNSアカウントを追加しました',
  profileUpdated: 'プロフィールを更新しました',
  enterTitleAndUrl: '表示名とURLを入力してください',
  enterUrl: 'URLを入力してください',
  // Admin Page
  addSocialAccount: 'SNSアカウントを追加',
  editLinkTitle: 'タイトル',
  editLinkUrl: 'URL',
  saveLink: '保存',
  deleteLink: '削除',
  updateLink: 'リンク更新',
  linkNamePlaceholder: 'リンク名を入れる',
  urlPlaceholder: 'https:// または http://で始まるURLを入れる',
  // Account deletion
  deleteAccount: 'アカウントを削除',
  deleteAccountConfirmTitle: 'アカウント削除の確認',
  deleteAccountConfirmMessage: 'この操作は取り消しできません。本当にアカウントを削除しますか？',
  deleteAccountConfirmButton: '削除する',
  cancel: 'キャンセル',
  // Login errors
  invalidCredentials: 'メールアドレスまたはパスワードが間違っています',
  accountNotExists: 'アカウントが存在しません',
  loginFailed: 'ログインに失敗しました',
  networkError: 'ネットワークエラーが発生しました',
  // Registration errors
  usernameExists: 'このユーザー名は既に使用されています',
  emailExists: 'このメールアドレスは既に使用されています',
  usernameNotAvailable: 'このユーザー名は使用できません',
  registrationFailed: 'アカウント作成に失敗しました',
  passwordMismatch: 'パスワードが一致しません',
  passwordTooShort: 'パスワードは4文字以上で入力してください',
  accountCreated: 'アカウントが作成されました！ログイン画面に移動します...',
};

const en: Dict = {
  // Navbar
  signIn: 'Sign In',
  signUp: 'Sign Up',
  editProfile: 'Edit profile',
  logout: 'Logout',
  // Home
  heroDescription: 'Create your unique digital presence. Build a stunning profile page with Ocha, showcase your personality, and share all your important links in one beautiful, personalized space.',
  getStarted: 'Get started',
  features1Title: 'Refined Minimal Aesthetics',
  features1Desc: 'Up to 10 links, cleanly laid out with generous whitespace and balanced typography to elevate your presence.',
  features2Title: 'Brand with Your Own Image',
  features2Desc: 'Upload your unique profile image in PNG or JPEG format to express your personality. Elegant default icons are available when you prefer simplicity.',
  features3Title: 'Minimal by Design',
  features3Desc: 'A clean, distraction-free interface that highlights what matters and never gets in the way.',
  privacy: 'Privacy Policy',
  terms: 'Terms',
  authorInfo: 'About the creator',
  // Auth
  autoLogin: 'Keep me signed in',
  signingIn: 'Signing in...',
  creatingAccount: 'Creating account...',
  // Profile Edit
  profileEditTitle: 'Edit Profile',
  basicInfo: 'Basic Information',
  displayName: 'Display Name',
  displayNamePlaceholder: 'Your name',
  biography: 'Biography',
  biographyPlaceholder: 'Tell us about yourself...',
  saveBasicInfo: 'Save Basic Info',
  saving: 'Saving...',
  linksManagement: 'Links Management',
  addNewLink: 'Add New Link',
  linkTitlePlaceholder: 'Display name (e.g., Blog, Portfolio)',
  linkUrlPlaceholder: 'URL (e.g., example.com)',
  addLink: 'Add Link',
  currentLinks: 'Current Links',
  noLinksYet: 'No links yet',
  snsManagement: 'Social Media Management',
  platform: 'Platform',
  snsUrlPlaceholder: 'Profile URL (e.g., github.com/username)',
  addSns: 'Add SNS',
  registeredSns: 'Registered Social Accounts',
  noSnsYet: 'No social accounts yet',
  viewProfile: 'View Profile',
  linkAdded: 'Link added successfully',
  linkDeleted: 'Link deleted successfully',
  snsAdded: 'Social account added successfully',
  profileUpdated: 'Profile updated successfully',
  enterTitleAndUrl: 'Please enter both display name and URL',
  enterUrl: 'Please enter URL',
  // Admin Page
  addSocialAccount: 'Add Social Account',
  editLinkTitle: 'Title',
  editLinkUrl: 'URL',
  saveLink: 'Save',
  deleteLink: 'Delete',
  updateLink: 'Update Link',
  linkNamePlaceholder: 'Enter link name',
  urlPlaceholder: 'Enter URL starting with https:// or http://',
  // Account deletion
  deleteAccount: 'Delete Account',
  deleteAccountConfirmTitle: 'Confirm Account Deletion',
  deleteAccountConfirmMessage: 'This action cannot be undone. Are you sure you want to delete your account?',
  deleteAccountConfirmButton: 'Delete',
  cancel: 'Cancel',
  // Login errors
  invalidCredentials: 'Invalid email address or password',
  accountNotExists: 'Account does not exist',
  loginFailed: 'Login failed',
  networkError: 'Network error occurred',
  // Registration errors
  usernameExists: 'This username is already taken',
  emailExists: 'This email address is already in use',
  usernameNotAvailable: 'This username is not available',
  registrationFailed: 'Account creation failed',
  passwordMismatch: 'Passwords do not match',
  passwordTooShort: 'Password must be at least 4 characters',
  accountCreated: 'Account created! Redirecting to sign in...',
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
