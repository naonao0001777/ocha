"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient, ApiError, type UserProfile, type Link, type SocialAccount, type CreateLinkRequest, type CreateSocialAccountRequest } from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import { Plus, Trash2, ExternalLink, Edit, Check, X } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import Navbar from '@/components/Layout/Navbar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function EditProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated, userId: authUserId, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile data
  const [name, setName] = useState('');
  const [biography, setBiography] = useState('');
  const [links, setLinks] = useState<Link[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  
  // New link form
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  
  // New social account form
  const [newSocialPlatform, setNewSocialPlatform] = useState<'youtube' | 'x' | 'twitch' | 'github' | 'instagram' | 'facebook'>('youtube');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  
  // Edit social account state
  const [editingSocialId, setEditingSocialId] = useState<number | null>(null);
  const [editSocialPlatform, setEditSocialPlatform] = useState<'youtube' | 'x' | 'twitch' | 'github' | 'instagram' | 'facebook'>('youtube');
  const [editSocialUrl, setEditSocialUrl] = useState('');

  // Account deletion state
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    console.log('[ProfileEdit] useEffect - Auth state:', { isAuthenticated, authUserId });
    
    // 認証状態がまだ確定していない場合は待機
    if (isAuthenticated === undefined) {
      console.log('[ProfileEdit] Authentication state not yet determined, waiting...');
      return;
    }
    
    if (!isAuthenticated || !authUserId) {
      console.log('[ProfileEdit] Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    console.log('[ProfileEdit] Loading user profile for:', authUserId);
    apiClient.getUserProfile(authUserId)
      .then((data) => {
        setName(data.user.name || '');
        setBiography(data.user.biography || '');
        setLinks(data.links || []);
        setSocialAccounts(data.social_accounts || []);
      })
      .catch((e) => {
        console.error(e);
        setError('Failed to load profile');
      });
  }, [isAuthenticated, authUserId, router]);

  // Auto-add https:// if not present
  const ensureHttps = (url: string) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  // Add new link
  const handleAddLink = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      setError(t('enterTitleAndUrl'));
      return;
    }

    const userId = authUserId;
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const newLink = await apiClient.createLink(userId, {
        title: newLinkTitle.trim(),
        url: ensureHttps(newLinkUrl.trim())
      });
      setLinks([...links, newLink]);
      setNewLinkTitle('');
      setNewLinkUrl('');
      setSuccess(t('linkAdded'));
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message || 'Failed to add link');
    } finally {
      setLoading(false);
    }
  };

  // Delete link
  const handleDeleteLink = async (linkId: number) => {
    const userId = authUserId;
    if (!userId) return;

    try {
      setLoading(true);
      await apiClient.deleteLink(userId, linkId);
      setLinks(links.filter(link => link.id !== linkId));
      setSuccess(t('linkDeleted'));
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message || 'Failed to delete link');
    } finally {
      setLoading(false);
    }
  };

  // Add new social account
  const handleAddSocial = async () => {
    if (!newSocialUrl.trim()) {
      setError(t('enterUrl'));
      return;
    }

    const userId = authUserId;
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const newSocial = await apiClient.createSocialAccount(userId, {
        platform: newSocialPlatform,
        url: ensureHttps(newSocialUrl.trim())
      });
      setSocialAccounts([...socialAccounts, newSocial]);
      setNewSocialUrl('');
      setSuccess(t('snsAdded'));
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message || 'Failed to add social account');
    } finally {
      setLoading(false);
    }
  };

  // Delete social account
  const handleDeleteSocial = async (socialId: number) => {
    const userId = authUserId;
    if (!userId) return;

    try {
      setLoading(true);
      await apiClient.deleteSocialAccount(userId, socialId);
      setSocialAccounts(socialAccounts.filter(social => social.id !== socialId));
      setSuccess(t('snsDeleted'));
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message || 'Failed to delete social account');
    } finally {
      setLoading(false);
    }
  };

  // Start editing social account
  const handleEditSocial = (social: SocialAccount) => {
    setEditingSocialId(social.id);
    setEditSocialPlatform(social.platform as typeof editSocialPlatform);
    setEditSocialUrl(social.url);
  };

  // Cancel editing social account
  const handleCancelEditSocial = () => {
    setEditingSocialId(null);
    setEditSocialPlatform('youtube');
    setEditSocialUrl('');
  };

  // Update social account
  const handleUpdateSocial = async (socialId: number) => {
    if (!editSocialUrl.trim()) {
      setError(t('enterUrl'));
      return;
    }

    const userId = authUserId;
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const updatedSocial = await apiClient.updateSocialAccount(userId, socialId, {
        platform: editSocialPlatform,
        url: ensureHttps(editSocialUrl.trim())
      });
      setSocialAccounts(socialAccounts.map(social => 
        social.id === socialId ? updatedSocial : social
      ));
      setEditingSocialId(null);
      setSuccess(t('snsUpdated'));
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message || 'Failed to update social account');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const userId = authUserId;
    if (!userId) {
      router.push('/login');
      return;
    }

    try {
      await apiClient.updateUserProfile(userId, {
        name: name || undefined,
        biography: biography || undefined,
      });
      setSuccess(t('profileUpdated'));
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message || '更新に失敗しました');
      if (e?.status === 401) {
        tokenManager.removeToken();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    const userId = authUserId;
    if (!userId) return;

    try {
      setIsDeleting(true);
      setError(null);
      
      await apiClient.deleteAccount(userId);
      
      // Clear tokens and redirect to home
      tokenManager.removeToken();
      router.push('/');
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // 認証状態が確定していない場合のローディング
  if (isAuthenticated === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      <div className="container mx-auto px-4 max-w-4xl py-6">
        <h1 className="text-3xl font-bold mb-6">{t('profileEditTitle')}</h1>

      {error && (
        <Alert className="mb-4 text-red-600 bg-red-50 border-red-200 whitespace-nowrap overflow-hidden text-ellipsis">{error}</Alert>
      )}
      {success && (
        <Alert className="mb-4 text-green-600 bg-green-50 border-green-200 whitespace-nowrap overflow-hidden text-ellipsis">{success}</Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="mb-2 block">{t('displayName')}</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('displayNamePlaceholder')}
                />
              </div>
              <div>
                <Label className="mb-2 block">{t('biography')}</Label>
                <Textarea 
                  value={biography} 
                  onChange={(e) => setBiography(e.target.value)} 
                  rows={4}
                  placeholder={t('biographyPlaceholder')}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t('saving') : t('saveBasicInfo')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Links Management */}
        <Card>
          <CardHeader>
            <CardTitle>{t('linksManagement')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new link */}
            <div className="space-y-2">
              <Label>{t('addNewLink')}</Label>
              <Input
                placeholder={t('linkTitlePlaceholder')}
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
              />
              <Input
                placeholder={t('linkUrlPlaceholder')}
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
              />
              <Button onClick={handleAddLink} disabled={loading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {t('addLink')}
              </Button>
            </div>

            {/* Existing links */}
            <div className="space-y-2">
              <Label>{t('currentLinks')}</Label>
              {links.length === 0 ? (
                <p className="text-sm text-gray-500">{t('noLinksYet')}</p>
              ) : (
                links.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{link.title}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {link.url}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteLink(link.id)}
                      variant="destructive"
                      size="sm"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Accounts Management */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('snsManagement')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new social account */}
            <div className="grid gap-2 md:grid-cols-3">
              <div>
                <Label>{t('platform')}</Label>
                <Select value={newSocialPlatform} onValueChange={(value: typeof newSocialPlatform) => setNewSocialPlatform(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="x">𝕏 (Twitter)</SelectItem>
                    <SelectItem value="twitch">Twitch</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  placeholder={t('snsUrlPlaceholder')}
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddSocial} disabled={loading} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addSns')}
                </Button>
              </div>
            </div>

            {/* Existing social accounts */}
            <div>
              <Label className="mb-2 block">{t('registeredSns')}</Label>
              {socialAccounts.length === 0 ? (
                <p className="text-sm text-gray-500">{t('noSnsYet')}</p>
              ) : (
                <div className="grid gap-2 md:grid-cols-1">
                  {socialAccounts.map((social) => (
                    <div key={social.id} className="p-3 border rounded">
                      {editingSocialId === social.id ? (
                        // Edit mode
                        <div className="space-y-2">
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <Label>{t('platform')}</Label>
                              <Select value={editSocialPlatform} onValueChange={(value: typeof editSocialPlatform) => setEditSocialPlatform(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="youtube">YouTube</SelectItem>
                                  <SelectItem value="x">𝕏 (Twitter)</SelectItem>
                                  <SelectItem value="twitch">Twitch</SelectItem>
                                  <SelectItem value="github">GitHub</SelectItem>
                                  <SelectItem value="instagram">Instagram</SelectItem>
                                  <SelectItem value="facebook">Facebook</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>URL</Label>
                              <Input
                                value={editSocialUrl}
                                onChange={(e) => setEditSocialUrl(e.target.value)}
                                placeholder={t('snsUrlPlaceholder')}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUpdateSocial(social.id)}
                              size="sm"
                              disabled={loading}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {t('save')}
                            </Button>
                            <Button
                              onClick={handleCancelEditSocial}
                              variant="outline"
                              size="sm"
                              disabled={loading}
                            >
                              <X className="w-4 h-4 mr-1" />
                              {t('cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium capitalize">{social.platform}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {social.url}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => handleEditSocial(social)}
                              variant="outline"
                              size="sm"
                              disabled={loading}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteSocial(social.id)}
                              variant="destructive"
                              size="sm"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t('cancel')}
        </Button>
        <Button onClick={() => router.push('/profile')}>
          {t('viewProfile')}
        </Button>
      </div>

      {/* Account Deletion Section */}
      <Card className="mt-8 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">{t('deleteAccount')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            {t('deleteAccountConfirmMessage')}
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : t('deleteAccount')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('deleteAccountConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('deleteAccountConfirmMessage')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {t('deleteAccountConfirmButton')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
