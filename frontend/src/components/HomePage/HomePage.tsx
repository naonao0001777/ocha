'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';

const OchaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 512 512" className="inline ml-2">
    <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
  </svg>
);

interface HomePageProps {
  message?: string;
}

const HomePage: React.FC<HomePageProps> = ({ message }) => {
  const [showDataPolicy, setShowDataPolicy] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <Card className="mb-12 border-0 bg-gradient-to-r from-card/80 to-card shadow-2xl">
          <CardContent className="p-8 md:p-12 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 flex items-center justify-center">
              Ocha
              <OchaIcon />
            </h1>
            
            {message && (
              <Alert className="mb-6 bg-primary/10 border-primary">
                <AlertDescription className="text-center text-primary-foreground">
                  {message}
                </AlertDescription>
              </Alert>
            )}
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Ochaはリンクをまとめてプロフィールに追加することができるプロフィールサービスです
            </p>
            
            <Button 
              size="lg"
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Link href="/register">
                はじめる
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow duration-200 border-muted">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-foreground">最大10個まで</h3>
              <p className="text-muted-foreground">
                リンクを追加することができるのは最大10個までです。
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200 border-muted">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-foreground">プロフィール画像を追加</h3>
              <p className="text-muted-foreground">
                png,jpeg形式の画像をプロフィール画像として使用できます。もちろん使用しなくてもデフォルトのアイコンが当てられます。
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200 border-muted">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-foreground">アカウントを作成</h3>
              <p className="text-muted-foreground">
                アカウントを作成していただきますが、もちろん削除してもう一度再利用することができます。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Policy Section */}
        <div className="text-center">
          <Dialog open={showDataPolicy} onOpenChange={setShowDataPolicy}>
            <DialogTrigger asChild>
              <Button variant="link" className="text-muted-foreground hover:text-primary">
                データの取扱いについて
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">データの取扱いについて</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 text-sm text-muted-foreground">
                <ul className="space-y-3 list-disc list-inside">
                  <li>
                    このサイトは
                    <a 
                      href="https://render.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline mx-1"
                    >
                      Render
                    </a>
                    によってDDos攻撃などからのセキュリティを保障されています。
                  </li>
                  <li>
                    このサイトに登録をされたことによって得たデータは、全てRenderに建てているデータベースに保管され、このサイトに使用される目的でのみ情報を取扱します。
                  </li>
                  <li>
                    また、アカウントを作成する際に入力するメールアドレスは適当なもので大丈夫です。
                  </li>
                  <li>
                    例えば、"a@example.com"など本来使用しているメールアドレスでなくともメール認証機能を実装していないため、他のユーザーとの被りがない限り本サイトを使用することができます。
                  </li>
                  <li>
                    また、アカウントを削除することで、ご登録いただいたメールアドレス、ID、パスワードはデータベースから削除されます。
                  </li>
                  <li>
                    当サイトはRenderにホストされていますが、無料枠での利用のため、15分間操作がない場合、サーバーの再起動が必要になります。
                  </li>
                  <li>
                    サーバーは再起動に最大30秒ほど要します。
                  </li>
                  <li>
                    また、データベース内に保管されたデータは3ヶ月後に全て消去されます。その際には再度ご登録いただく形になります。如何せん商用に使っていない個人開発ですので、その点ご了承ください。
                  </li>
                </ul>
                
                <div className="pt-6 border-t">
                  <h4 className="font-semibold mb-4 text-foreground">当サイト制作者の情報</h4>
                  <div className="flex justify-center space-x-6">
                    <a 
                      href="https://twitter.com/salty_special" 
                      target="_blank" 
                      rel="noopener noreferrer nofollow"
                      className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <img src="/assets/icon_x.png" className="w-8 h-8" alt="X" />
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a 
                      href="https://github.com/naonao0001777" 
                      target="_blank" 
                      rel="noopener noreferrer nofollow"
                      className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <img src="/assets/github.png" className="w-8 h-8" alt="GitHub" />
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default HomePage;