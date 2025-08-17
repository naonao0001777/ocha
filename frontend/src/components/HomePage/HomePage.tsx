'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

const OchaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 512 512" className="inline ml-2">
    <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
  </svg>
);

interface HomePageProps {
  message?: string;
}

const HomePage = ({ message }: HomePageProps) => {
  const { t } = useLanguage();
  return (
    <div className="relative min-h-screen">
      {/* Background: Beautiful tea field landscape */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Tea field inspired gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 dark:from-green-800 dark:via-emerald-900 dark:to-green-900" />
        
        {/* Layered mountain hills effect */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-green-600 to-transparent opacity-80" />
          <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-green-700 to-transparent opacity-60" />
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-green-800 to-transparent opacity-40" />
        </div>
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-white to-transparent mix-blend-overlay" />
        
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-transparent to-transparent dark:from-blue-900 dark:via-transparent dark:to-transparent opacity-60" />
        
        {/* Content readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-transparent dark:from-black/30 dark:via-black/20 dark:to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <Card className="mb-12 border border-white/20 dark:border-white/5 bg-white/30 dark:bg-neutral-900/20 backdrop-blur-lg shadow-2xl">
          <CardContent className="p-8 md:p-12 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center">
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
            
            <p className="text-xl text-gray-800 dark:text-gray-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>
            
            <Button 
              size="lg"
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Link href="/register">
                {t('getStarted')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-white/5 bg-white/25 dark:bg-neutral-900/15 backdrop-blur-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('features1Title')}</h3>
              <p className="text-gray-700 dark:text-gray-200">
                {t('features1Desc')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-white/5 bg-white/25 dark:bg-neutral-900/15 backdrop-blur-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('features2Title')}</h3>
              <p className="text-gray-700 dark:text-gray-200">
                {t('features2Desc')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-white/5 bg-white/25 dark:bg-neutral-900/15 backdrop-blur-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('features3Title')}</h3>
              <p className="text-gray-700 dark:text-gray-200">
                {t('features3Desc')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Links and Author Info */}
        <div className="text-center">
          <div className="mb-6 text-sm space-x-4">
            <Link href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-primary underline underline-offset-4">
              料金プラン
            </Link>
            <Link href="/privacy" className="text-gray-700 dark:text-gray-300 hover:text-primary underline underline-offset-4">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="text-gray-700 dark:text-gray-300 hover:text-primary underline underline-offset-4">
              {t('terms')}
            </Link>
          </div>

          <div className="pt-6 border-t">
            <h4 className="font-semibold mb-4 text-gray-800 dark:text-white">{t('authorInfo')}</h4>
            <div className="flex justify-center space-x-6">
              <a 
                href="https://github.com/naonao0001777" 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Image src="/assets/github.png" width={32} height={32} className="w-8 h-8" alt="GitHub" />
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;