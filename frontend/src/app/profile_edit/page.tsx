"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { apiClient, tokenManager, ApiError } from '@/lib/api';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [biography, setBiography] = useState('');

  useEffect(() => {
    const userId = tokenManager.getCurrentUserId();
    if (!userId) {
      router.push('/login');
      return;
    }
    apiClient.getUserProfile(userId)
      .then((data) => {
        setName(data.user.name || '');
        setBiography(data.user.biography || '');
      })
      .catch((e) => {
        console.error(e);
        setError('プロフィールの読み込みに失敗しました');
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const userId = tokenManager.getCurrentUserId();
    if (!userId) {
      router.push('/login');
      return;
    }

    try {
      await apiClient.updateUserProfile(userId, {
        name: name || undefined,
        biography: biography || undefined,
      });
      setSuccess('プロフィールを更新しました');
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

  return (
    <div className="container mx-auto px-4 max-w-xl">
      <h1 className="text-2xl font-bold mt-6 mb-4">Edit profile</h1>

      {error && (
        <Alert className="mb-4 whitespace-nowrap overflow-hidden text-ellipsis">{error}</Alert>
      )}
      {success && (
        <Alert className="mb-4 whitespace-nowrap overflow-hidden text-ellipsis">プロフィールを更新しました</Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-2 block">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Biography</Label>
              <Textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={6} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
