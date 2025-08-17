'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Link as LinkIcon, 
  Palette, 
  Eye, 
  CreditCard,
  Settings,
  HelpCircle
} from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

// モックデータ（実際の実装では API から取得）
const mockUser = {
  name: 'デモユーザー',
  email: 'demo@example.com',
  plan: {
    name: 'Free',
    slug: 'free',
    max_links: 3,
    has_themes: false,
    has_ads: true
  },
  usage: {
    current_links: 2
  },
  subscription: {
    status: 'active',
    current_period_end: '2024-12-31'
  }
};

const UsageCard = () => {
  const usagePercentage = (mockUser.usage.current_links / mockUser.plan.max_links) * 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <LinkIcon className="w-5 h-5" />
          <span>使用状況</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>リンク数</span>
            <span>{mockUser.usage.current_links} / {mockUser.plan.max_links}</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>
        
        {usagePercentage > 80 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              リンク数が上限に近づいています。
              {mockUser.plan.slug === 'free' && (
                <Link href="/pricing" className="text-amber-900 underline ml-1">
                  Proプランでより多くのリンクを追加
                </Link>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PlanCard = () => {
  const isPro = mockUser.plan.slug === 'pro';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isPro ? <Crown className="w-5 h-5 text-yellow-500" /> : <Settings className="w-5 h-5" />}
          <span>現在のプラン</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">{mockUser.plan.name}</h3>
              <Badge variant={isPro ? 'default' : 'secondary'}>
                {isPro ? '有料' : '無料'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              リンク数: {mockUser.plan.max_links}個まで
            </p>
          </div>
          {!isPro && (
            <Button asChild>
              <Link href="/pricing">
                アップグレード
              </Link>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span className="text-sm">
              テーマ: {mockUser.plan.has_themes ? '選択可能' : 'デフォルトのみ'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm">
              広告: {mockUser.plan.has_ads ? 'あり' : 'なし'}
            </span>
          </div>
        </div>
        
        {isPro && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              次回更新日: {mockUser.subscription.current_period_end}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BillingCard = () => {
  const isPro = mockUser.plan.slug === 'pro';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>請求情報</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPro ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>月額料金</span>
              <span className="font-semibold">¥500</span>
            </div>
            <div className="flex justify-between items-center">
              <span>支払い方法</span>
              <span className="text-sm text-muted-foreground">**** **** **** 1234</span>
            </div>
            <Button variant="outline" className="w-full">
              請求履歴を表示
            </Button>
            <Button variant="outline" className="w-full">
              支払い方法を変更
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              現在無料プランをご利用中です
            </p>
            <Button asChild>
              <Link href="/pricing">
                有料プランを見る
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'support'>('overview');

  return (
    <>
      <Navbar 
        isAuthenticated={true}
        onDemoLogin={() => {}}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">アカウント設定</h1>
          <p className="text-muted-foreground">
            プランの管理、使用状況の確認、請求情報の管理
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              概要
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'billing'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              請求・支払い
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'support'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              サポート
            </button>
          </nav>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <PlanCard />
              <UsageCard />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>クイックアクション</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/profile/edit">
                      プロフィールを編集
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/u/${mockUser.name}`}>
                      プロフィールを表示
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/pricing">
                      プランを比較
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="max-w-2xl">
            <BillingCard />
          </div>
        )}

        {activeTab === 'support' && (
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>サポート</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    よくある質問を見る
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    お問い合わせ
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    利用規約・プライバシーポリシー
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">アカウント管理</h4>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    アカウントを削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
