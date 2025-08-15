'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Upload, ChevronDown, ChevronUp, ExternalLink, Plus } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

const OchaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
    <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
  </svg>
);

interface SocialAccount {
  youtube?: string;
  x?: string;
  twitch?: string;
  github?: string;
  instagram?: string;
  facebook?: string;
}

interface Link {
  id: number;
  title: string;
  url: string;
}

interface UserProfile {
  userId: string;
  userName: string;
  biography: string;
  profileImage?: string;
  socialAccounts: SocialAccount;
  links: Link[];
}

interface AdminPageProps {
  userProfile: UserProfile;
  message?: string;
  onProfileImageUpload?: (file: File) => void;
  onProfileImageDelete?: () => void;
  onSocialAccountUpdate?: (accounts: SocialAccount) => void;
  onLinkAdd?: (title: string, url: string) => void;
  onLinkUpdate?: (linkId: number, title: string, url: string) => void;
  onLinkDelete?: (linkId: number) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({
  userProfile,
  message,
  onProfileImageUpload,
  onProfileImageDelete,
  onSocialAccountUpdate,
  onLinkAdd,
  onLinkUpdate,
  onLinkDelete
}) => {
   const { t } = useLanguage();
   const [showSNSCollapse, setShowSNSCollapse] = useState(false);
   const [showLinkCollapse, setShowLinkCollapse] = useState(false);
   const [socialAccounts, setSocialAccounts] = useState(userProfile.socialAccounts);
   const [newLink, setNewLink] = useState({ title: '', url: '' });
   const [editingLinks, setEditingLinks] = useState<{[key: number]: {title: string, url: string}}>({});
  const [showMessage, setShowMessage] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (message) {
      setShowMessage(true);
      // メッセージが更新されたら自動で表示位置までスクロール
      setTimeout(() => {
        messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    }
  }, [message]);
   
   // Dropdown とは独立した hidden file input（メニュー閉鎖で DOM から消えないようにする）
   const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('[AdminPage] handleFileUpload fired. File:', file?.name, file?.type, file?.size);
    if (file && onProfileImageUpload) {
      onProfileImageUpload(file);
    }
  };

  const handleSocialAccountChange = (platform: keyof SocialAccount, value: string) => {
    setSocialAccounts(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSocialAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSocialAccountUpdate) {
      onSocialAccountUpdate(socialAccounts);
    }
  };

  const handleNewLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLink.title && newLink.url && onLinkAdd) {
      onLinkAdd(newLink.title, newLink.url);
      setNewLink({ title: '', url: '' });
    }
  };

  const handleLinkEdit = (linkId: number, title: string, url: string) => {
    setEditingLinks(prev => {
      if (prev[linkId]) {
        const newEditing = { ...prev };
        delete newEditing[linkId];
        return newEditing;
      }
      return {
        ...prev,
        [linkId]: { title, url }
      };
    });
  };

  const handleLinkUpdate = (linkId: number) => {
    const editData = editingLinks[linkId];
    if (editData && onLinkUpdate) {
      onLinkUpdate(linkId, editData.title, editData.url);
      setEditingLinks(prev => {
        const newEditing = { ...prev };
        delete newEditing[linkId];
        return newEditing;
      });
    }
  };

  const renderSocialIcon = (platform: string, url?: string) => {
    if (!url) return null;

    // プラットフォームごとのアイコンマップ（Xのみ特例: icon_x.png）
    const iconMap: Record<string, string> = {
      youtube: '/assets/youtube_icon.png',
      icon_x: '/assets/icon_x.png', // 呼び出し側が 'icon_x' を渡す想定に対応
      x: '/assets/icon_x.png',      // 念のため 'x' でも対応
      twitch: '/assets/twitch_icon.png',
      github: '/assets/github_icon.png',
      instagram: '/assets/instagram_icon.png',
      facebook: '/assets/facebook_icon.png',
    };

    const src = iconMap[platform] ?? `/assets/${platform}_icon.png`;

    return (
      <a 
        className="inline-flex focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full p-1 hover:bg-accent transition-colors"
        href={url}
        target="_blank" 
        rel="noopener noreferrer"
      >
        <img 
          width="35" 
          height="35" 
          src={src}
          alt={platform} 
          className="rounded-full"
        />
      </a>
    );
  };

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

      <div className="container mx-auto px-4 text-center max-w-2xl py-8">
      {/* hidden file input for profile upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleFileUpload}
      />
      {message && showMessage && (
        <Alert className="mb-4 text-center relative scroll-mt-24 md:scroll-mt-28">
           <button
             type="button"
             aria-label="閉じる"
             className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
             onClick={() => setShowMessage(false)}
           >
             ×
           </button>
           <AlertDescription className="text-foreground">
             <div ref={messageRef} className="whitespace-nowrap overflow-hidden text-ellipsis">
               {message}
             </div>
           </AlertDescription>
         </Alert>
       )}

      {/* Profile Image Section */}
      <div className="flex justify-center my-8">
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative p-0 rounded-full hover:bg-transparent"
              >
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded text-center border flex items-center justify-center z-10"
                     style={{ width: '60px', height: '30px', fontSize: '12px' }}>
                  <Upload size={13} className="mr-1" />
                  <strong>Edit</strong>
                </div>
                {userProfile.profileImage ? (
                  <img 
                    src={userProfile.profileImage} 
                    className="rounded-full" 
                    width="100" 
                    height="100" 
                    alt="Profile" 
                  />
                ) : (
                  <img 
                    src="/assets/default_leaf.png" 
                    className="rounded-full" 
                    width="100" 
                    height="100" 
                    alt="Default Profile" 
                  />
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onSelect={(e) => {
                  // メニューのデフォルト動作（即閉じ）を防ぎつつ、ファイルダイアログを開く
                  e.preventDefault();
                  fileInputRef.current?.click();
                }}
              >
                Upload a Photo
              </DropdownMenuItem>
               <DropdownMenuItem
                onSelect={(e) => {
                  // メニュークローズのタイミングと競合しないよう抑止し、後段で非同期に発火
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[AdminPage] Remove Photo selected');
                  setTimeout(() => {
                    onProfileImageDelete?.();
                  }, 0);
                }}
               >
                  Remove Photo
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* User Name and Profile URL */}
      <div className="flex justify-center items-center mt-4 mb-2">
        <h3 className="text-2xl font-bold mr-2">{userProfile.userName}</h3>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full p-2 h-8 w-8"
          onClick={() => window.open(`/u/${userProfile.userId}`, '_blank')}
          title="プロフィールURLに行く"
        >
          <ExternalLink size={16} />
        </Button>
      </div>

      {/* Biography */}
      <div className="flex justify-center mt-2 mb-4">
        <p className="font-semibold text-center">{userProfile.biography}</p>
      </div>

      {/* Social Media Icons */}
      <div className="flex justify-center mt-2 mb-4">
        <div className="flex space-x-2">
          {renderSocialIcon('youtube', socialAccounts.youtube)}
          {renderSocialIcon('icon_x', socialAccounts.x)}
          {renderSocialIcon('twitch', socialAccounts.twitch)}
          {renderSocialIcon('github', socialAccounts.github)}
          {renderSocialIcon('instagram', socialAccounts.instagram)}
          {renderSocialIcon('facebook', socialAccounts.facebook)}
        </div>
      </div>

      {/* SNS Account Addition */}
      <div className="my-6">
        <Collapsible open={showSNSCollapse} onOpenChange={setShowSNSCollapse}>
          <CollapsibleTrigger asChild>
            <Button className="rounded-full mb-4 w-full max-w-md">
              {t('addSocialAccount')}
              {showSNSCollapse ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <Card className="max-w-md mx-auto border border-white/20 dark:border-white/5 bg-white/30 dark:bg-neutral-900/20 backdrop-blur-lg shadow-2xl">
              <CardContent className="pt-6">
                <form onSubmit={handleSocialAccountSubmit} className="space-y-4">
                  <div>
                    <Label className="flex items-center text-left mb-2">
                      <img width="35" height="35" src="/assets/youtube_icon.png" alt="YouTube" className="mr-2" />
                      YouTube
                    </Label>
                    <Input
                      type="url"
                      placeholder={t('urlPlaceholder')}
                      value={socialAccounts.youtube || ''}
                      onChange={(e) => handleSocialAccountChange('youtube', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center text-left mb-2">
                      <img width="35" height="35" src="/assets/twitch_icon.png" alt="Twitch" className="mr-2" />
                      Twitch
                    </Label>
                    <Input
                      type="url"
                      placeholder={t('urlPlaceholder')}
                      value={socialAccounts.twitch || ''}
                      onChange={(e) => handleSocialAccountChange('twitch', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center text-left mb-2">
                      <img width="35" height="35" src="/assets/icon_x.png" alt="X" className="mr-2" />
                      X
                    </Label>
                    <Input
                      type="url"
                      placeholder={t('urlPlaceholder')}
                      value={socialAccounts.x || ''}
                      onChange={(e) => handleSocialAccountChange('x', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center text-left mb-2">
                      <img width="35" height="35" src="/assets/github_icon.png" alt="GitHub" className="mr-2" />
                      GitHub
                    </Label>
                    <Input
                      type="url"
                      placeholder={t('urlPlaceholder')}
                      value={socialAccounts.github || ''}
                      onChange={(e) => handleSocialAccountChange('github', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center text-left mb-2">
                      <img width="35" height="35" src="/assets/instagram_icon.png" alt="Instagram" className="mr-2" />
                      Instagram
                    </Label>
                    <Input
                      type="url"
                      placeholder={t('urlPlaceholder')}
                      value={socialAccounts.instagram || ''}
                      onChange={(e) => handleSocialAccountChange('instagram', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center text-left mb-2">
                      <img width="35" height="35" src="/assets/facebook_icon.png" alt="Facebook" className="mr-2" />
                      Facebook
                    </Label>
                    <Input
                      type="url"
                      placeholder={t('urlPlaceholder')}
                      value={socialAccounts.facebook || ''}
                      onChange={(e) => handleSocialAccountChange('facebook', e.target.value)}
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      size="sm"
                      className="rounded-full w-8 h-8 p-0"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Link Addition */}
      <div className="my-6">
        <Collapsible open={showLinkCollapse} onOpenChange={setShowLinkCollapse}>
          <CollapsibleTrigger asChild>
            <Button className="rounded-full mb-4 w-full max-w-md">
              {t('addLink')}
              {showLinkCollapse ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <Card className="max-w-md mx-auto border border-white/20 dark:border-white/5 bg-white/30 dark:bg-neutral-900/20 backdrop-blur-lg shadow-2xl">
              <CardContent className="pt-6">
                <form onSubmit={handleNewLinkSubmit} className="space-y-4">
                  <div>
                    <Label className="text-left mb-2 block">{t('editLinkTitle')}</Label>
                    <Input
                      type="text"
                      placeholder={t('linkNamePlaceholder')}
                      value={newLink.title}
                      onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label className="text-left mb-2 block">{t('editLinkUrl')}</Label>
                    <Input
                      type="url"
                      placeholder={t('urlPlaceholder')}
                      value={newLink.url}
                      onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      size="sm"
                      className="rounded-full w-8 h-8 p-0"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Existing Links */}
      <div className="space-y-4">
        {userProfile.links.map((link) => (
          <div key={link.id} className="w-full max-w-md mx-auto">
            <Button
              variant="outline"
              className="w-full rounded-full py-3 text-lg"
              onClick={() => handleLinkEdit(link.id, link.title, link.url)}
            >
              {link.title}
            </Button>
            
            <Collapsible open={!!editingLinks[link.id]} onOpenChange={(open) => {
              if (!open) {
                setEditingLinks(prev => {
                  const newEditing = { ...prev };
                  delete newEditing[link.id];
                  return newEditing;
                });
              }
            }}>
              <CollapsibleContent>
                <Card className="mt-2 border border-white/20 dark:border-white/5 bg-white/25 dark:bg-neutral-900/15 backdrop-blur-lg">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-left mb-2 block">{t('editLinkTitle')}</Label>
                        <Input
                          type="text"
                          placeholder={t('linkNamePlaceholder')}
                          value={editingLinks[link.id]?.title || ''}
                          onChange={(e) => setEditingLinks(prev => ({
                            ...prev,
                            [link.id]: { ...prev[link.id], title: e.target.value }
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-left mb-2 block">{t('editLinkUrl')}</Label>
                        <Input
                          type="url"
                          placeholder={t('urlPlaceholder')}
                          value={editingLinks[link.id]?.url || ''}
                          onChange={(e) => setEditingLinks(prev => ({
                            ...prev,
                            [link.id]: { ...prev[link.id], url: e.target.value }
                          }))}
                        />
                      </div>
                      
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          className="rounded-full"
                          onClick={() => handleLinkUpdate(link.id)}
                        >
                          {t('updateLink')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => onLinkDelete && onLinkDelete(link.id)}
                        >
                          {t('deleteLink')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default AdminPage;