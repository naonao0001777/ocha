'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface NavbarProps {
  isAuthenticated?: boolean;
  onDemoLogin?: () => void;
  onLogout?: () => void;
}

const OchaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1.2em" viewBox="0 0 512 512" className="inline ml-1">
    <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated = false, onDemoLogin, onLogout }) => {
  const { t, locale, setLocale } = useLanguage();

  return (
    <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center text-xl font-bold text-foreground hover:text-primary transition-colors">
            Ocha
            <OchaIcon />
          </Link>
          
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">{locale === 'ja' ? '日本語' : 'English'}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => setLocale('ja')} className="cursor-pointer">日本語</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('en')} className="cursor-pointer">English</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isAuthenticated ? (
              <>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={onDemoLogin}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-950 dark:hover:text-orange-300"
                >
                  DEMO
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href="/login">{t('signIn')}</Link>
                </Button>
                <Button 
                  size="sm"
                  asChild
                  className="bg-primary hover:bg-primary/90"
                >
                  <Link href="/register">{t('signUp')}</Link>
                </Button>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem asChild>
                      <Link href="/profile_edit" className="cursor-pointer">
                        {t('editProfile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;