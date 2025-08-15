'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';

export default function PrivacyPage() {
  const { locale } = useLanguage();

  if (locale === 'en') {
    return (
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: August 14, 2025</p>
        <p className="text-muted-foreground mb-8">
          This Privacy Policy explains how the profile generator site &quot;ocha&quot; (the &quot;Service&quot;) collects and handles users&apos; personal and usage information.
        </p>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-muted-foreground mb-4">We may collect the following information:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Information entered or configured by the user</li>
            <ul className="list-disc list-inside ml-6 space-y-1">
              <li>Email address</li>
              <li>User ID</li>
              <li>Display name</li>
              <li>Profile image</li>
              <li>Bio</li>
              <li>Configured URLs</li>
            </ul>
            <li>Information automatically collected during use (access time, IP address, browser information, cookies, etc.)</li>
            <li>Information provided when contacting us (email address, inquiry details, etc.)</li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Purpose of Use</h2>
          <p className="text-muted-foreground mb-4">We use the collected information for the following purposes:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Service operation, improvement, and enhancement</li>
            <li>Prevention of unauthorized use and access</li>
            <li>Responding to inquiries</li>
            <li>Compliance with laws and regulations</li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Sharing of Information</h2>
          <p className="text-muted-foreground mb-4">We do not provide user information to third parties except in the following cases:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>With the users&apos; consent</li>
            <li>When disclosure is required by law</li>
            <li>When providing information to contractors for service operation (contractors are obligated to manage information appropriately)</li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Use of Cookies</h2>
          <p className="text-muted-foreground">
            We use cookies to improve convenience and analyze access. You can disable cookies in your browser settings if you prefer not to use them.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Security</h2>
          <p className="text-muted-foreground">
            We appropriately manage acquired information and take necessary measures to prevent leakage and alteration.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            This policy may be changed as necessary. Changes will take effect when posted on the Service.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">プライバシーポリシー</h1>
      <p className="text-sm text-muted-foreground mb-8">最終更新日：2025年8月14日</p>
      <p className="text-muted-foreground mb-8">
        本プライバシーポリシーは、プロフィールジェネレーターサイト「ocha」（以下「本サービス」）における、ユーザーの個人情報および利用情報の取り扱いについて定めるものです。
      </p>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. 収集する情報</h2>
        <p className="text-muted-foreground mb-4">本サービスは、以下の情報を収集する場合があります。</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>ユーザーが入力または設定した情報</li>
          <ul className="list-disc list-inside ml-6 space-y-1">
            <li>Eメールアドレス</li>
            <li>ユーザーID</li>
            <li>表示名</li>
            <li>プロフィール画像</li>
            <li>自己紹介文</li>
            <li>設定したURL</li>
          </ul>
          <li>サービス利用時に自動的に取得する情報（アクセス日時、IPアドレス、ブラウザ情報、クッキー情報など）</li>
          <li>ユーザーからのお問い合わせ時に提供される情報（メールアドレス、問い合わせ内容など）</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. 利用目的</h2>
        <p className="text-muted-foreground mb-4">収集した情報は、以下の目的のために利用します。</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>サービスの運営、改善、機能向上</li>
          <li>不正利用や不正アクセスの防止</li>
          <li>お問い合わせへの対応</li>
          <li>法令遵守のための対応</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. 情報の共有</h2>
        <p className="text-muted-foreground mb-4">本サービスは、以下の場合を除き、ユーザー情報を第三者に提供しません。</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>ユーザーの同意がある場合</li>
          <li>法令に基づき開示が必要な場合</li>
          <li>サービス運営上、業務委託先に提供する場合（委託先には適切な管理を義務付けます）</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Cookie等の使用</h2>
        <p className="text-muted-foreground">
          本サービスでは、利便性向上やアクセス解析のためにCookieを使用します。<br />
          Cookieの利用を希望しない場合、ブラウザの設定で無効化できます。
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. セキュリティ</h2>
        <p className="text-muted-foreground">
          本サービスは、取得した情報を適切に管理し、漏えいや改ざんを防ぐために必要な措置を講じます。
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. プライバシーポリシーの変更</h2>
        <p className="text-muted-foreground">
          本ポリシーは必要に応じて変更されることがあります。変更後は、本サービス上に掲示した時点で効力を生じます。
        </p>
      </section>
    </main>
  );
}
