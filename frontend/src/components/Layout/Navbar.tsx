'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center text-xl font-bold text-foreground hover:text-primary transition-colors">
            Ocha
            <OchaIcon />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-2">
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
                  asChild
                >
                  <Link href="/pricing">{locale === 'ja' ? '料金プラン' : 'Pricing'}</Link>
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={onDemoLogin}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-950 dark:hover:text-orange-300"
                >
                  {locale === 'ja' ? 'デモ体験' : 'Demo'}
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
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        プロフィール
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile_edit" className="cursor-pointer">
                        {t('editProfile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing" className="cursor-pointer">
                        {locale === 'ja' ? '料金プラン' : 'Pricing'}
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

          {/* Mobile Hamburger Button */}
          <div className="sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-border/40 py-4 space-y-3">
            <div className="flex items-center justify-center space-x-4 pb-3 border-b border-border/40">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">{locale === 'ja' ? '日本語' : 'English'}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-36">
                  <DropdownMenuItem onClick={() => setLocale('ja')} className="cursor-pointer">日本語</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocale('en')} className="cursor-pointer">English</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {!isAuthenticated ? (
              <div className="flex flex-col space-y-3 px-2">
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/pricing">{locale === 'ja' ? '料金プラン' : 'Pricing'}</Link>
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onDemoLogin?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-orange-600 border-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-950 dark:hover:text-orange-300"
                >
                  {locale === 'ja' ? 'デモ体験' : 'Demo'}
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/login">{t('signIn')}</Link>
                </Button>
                <Button 
                  size="sm"
                  asChild
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/register">{t('signUp')}</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 px-2">
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/profile">プロフィール</Link>
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/profile_edit">{t('editProfile')}</Link>
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/pricing">{locale === 'ja' ? '料金プラン' : 'Pricing'}</Link>
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onLogout?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full"
                >
                  {t('logout')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;