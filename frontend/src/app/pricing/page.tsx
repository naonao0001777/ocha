'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
}

const features: PlanFeature[] = [
  { name: 'リンク数', free: '3個まで', pro: '10個まで' },
  { name: 'プロフィール画像', free: true, pro: true },
  { name: 'テーマ選択', free: false, pro: true },
  { name: '広告表示', free: true, pro: false },
  { name: 'サポート', free: 'コミュニティ', pro: 'プライオリティ' },
];

const PlanCard = ({ 
  name, 
  price, 
  period = '', 
  features, 
  buttonText, 
  buttonVariant = 'default',
  highlighted = false,
  disabled = false 
}: {
  name: string;
  price: string;
  period?: string;
  features: string[];
  buttonText: string;
  buttonVariant?: 'default' | 'outline';
  highlighted?: boolean;
  disabled?: boolean;
}) => (
  <Card className={`relative ${highlighted ? 'border-primary shadow-lg scale-105' : ''}`}>
    {highlighted && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
          おすすめ
        </span>
      </div>
    )}
    <CardHeader className="text-center">
      <CardTitle className="text-2xl">{name}</CardTitle>
      <div className="text-3xl font-bold">
        {price}
        <span className="text-lg font-normal text-muted-foreground">{period}</span>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        className="w-full" 
        variant={buttonVariant}
        disabled={disabled}
      >
        {buttonText}
      </Button>
    </CardContent>
  </Card>
);

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, login, logout } = useAuth();

  const handleDemoLogin = async () => {
    try {
      console.log('[Pricing] Demo login initiated');
      const res = await apiClient.login({ email: 'demo@example.com', password: 'test' });
      if (res.success && res.access_token) {
        console.log('[Pricing] Demo login successful, setting token and redirecting');
        login(res.access_token, false);
        // 少し遅延を入れて認証状態が確実に更新されるのを待つ
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

  return (
    <>
      <Navbar 
        isAuthenticated={isAuthenticated}
        onDemoLogin={handleDemoLogin}
        onLogout={handleLogout}
      />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">料金プラン</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            あなたのニーズに合わせてプランをお選びください。
            いつでもアップグレード・ダウングレードが可能です。
          </p>
        </div>

        {/* プラン比較カード */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <PlanCard 
            name="Free"
            price="¥0"
            period="/月"
            features={[
              'リンク3個まで',
              'プロフィール画像アップロード',
              'デフォルトテーマ',
              '広告表示あり'
            ]}
            buttonText="現在のプラン"
            buttonVariant="outline"
            disabled
          />
          
          <PlanCard 
            name="Pro"
            price="¥500"
            period="/月"
            features={[
              'リンク10個まで',
              'プロフィール画像アップロード',
              '全テーマ選択可能',
              '広告なし',
              'プライオリティサポート'
            ]}
            buttonText="アップグレード"
            highlighted
          />
        </div>

        {/* 詳細比較表 */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">機能比較</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">機能</th>
                      <th className="text-center p-4 font-semibold">Free</th>
                      <th className="text-center p-4 font-semibold bg-primary/5">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="p-4 font-medium">{feature.name}</td>
                        <td className="p-4 text-center">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{feature.free}</span>
                          )}
                        </td>
                        <td className="p-4 text-center bg-primary/5">
                          {typeof feature.pro === 'boolean' ? (
                            feature.pro ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{feature.pro}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ セクション */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">よくある質問</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">プランはいつでも変更できますか？</h3>
                <p className="text-sm text-muted-foreground">
                  はい、いつでもプランの変更が可能です。アップグレードは即座に反映され、
                  ダウングレードは現在の契約期間終了時に適用されます。
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">支払い方法は何が利用できますか？</h3>
                <p className="text-sm text-muted-foreground">
                  クレジットカード（Visa、Mastercard、American Express、JCB）をご利用いただけます。
                  決済はStripeを通じて安全に処理されます。
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">無料トライアルはありますか？</h3>
                <p className="text-sm text-muted-foreground">
                  新規ユーザーの方には14日間のProプラン無料トライアルをご提供しています。
                  トライアル期間中はいつでもキャンセル可能です。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA セクション */}
        <div className="text-center mt-16">
          <div className="bg-primary/5 rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">今すぐ始めましょう</h2>
            <p className="text-muted-foreground mb-6">
              アカウントを作成して、あなただけのプロフィールページを作成しましょう。
            </p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/register">無料で始める</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">ログイン</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
