const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const SUPABASE_BUCKET = (process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET as string) || 'ocha-serverless-storage-bucket';

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface User {
  id: string;
  user_name: string;
  name: string;
  biography?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: number;
  title: string;
  url: string;
  order_index: number;
}

export interface SocialAccount {
  id: number;
  platform: string;
  url: string;
}

export interface UserProfile {
  user: User;
  links: Link[];
  social_accounts: SocialAccount[];
}

export interface CreateUserRequest {
  user_name: string;
  name: string;
  password?: string;
  biography?: string;
}

export interface CreateLinkRequest {
  title: string;
  url: string;
}

export interface CreateSocialAccountRequest {
  platform: 'youtube' | 'x' | 'twitch' | 'github' | 'instagram' | 'facebook';
  url: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  biography?: string;
  profile_image?: string | null;
}

export interface PresignedUrlResponse {
  upload_url: string;
  file_key: string;
  token: string;
}

export interface LoginRequest {
  user_id: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user_id: string;
  user_name: string;
  message: string;
  access_token: string;
  token_type: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// トークン管理
export const tokenManager = {
  // remember=true の場合: localStorage に保存（ブラウザ再起動後も維持）
  // remember=false の場合: sessionStorage に保存（タブ/セッションが切れたら消える）
  setToken: (token: string, remember: boolean = false) => {
    try {
      if (remember) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('remember_me', '1');
        sessionStorage.removeItem('access_token');
      } else {
        sessionStorage.setItem('access_token', token);
        // 一度 remember で入った後に、通常ログインに切り替えた場合に備えてクリア
        localStorage.removeItem('remember_me');
      }
    } catch {}
  },
  
  getToken: (): string | null => {
    try {
      return sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
    } catch {
      return null;
    }
  },
  
  removeToken: () => {
    try {
      sessionStorage.removeItem('access_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('remember_me');
    } catch {}
  },
  
  isAuthenticated: (): boolean => {
    return !!tokenManager.getToken();
  },
  
  getCurrentUserId: (): string | null => {
    const token = tokenManager.getToken();
    if (!token) return null;
    try {
      // JWTトークンをデコード（簡単な実装）
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch {
      return null;
    }
  }
};

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  // 認証トークンを自動で追加
  const token = tokenManager.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    headers,
    ...options,
  });

  // 失敗時は本文が空でも安全にメッセージ抽出
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let message = 'API Error';
    if (errorText) {
      try {
        const errJson = JSON.parse(errorText);
        message = errJson?.detail || errJson?.message || message;
      } catch {
        message = errorText || message;
      }
    }
    throw new ApiError(response.status, message);
  }

  // No Content / 空ボディ対応
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const text = await response.text().catch(() => '');
  if (!text) {
    return undefined as unknown as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    // JSONでない場合も undefined を返す
    return undefined as unknown as T;
  }
}

export const apiClient = {
  // ユーザープロフィール取得
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    return fetchApi<UserProfile>(`/users/${userId}`);
  },

  // ユーザー作成
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    return fetchApi<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // リンク作成
  createLink: async (userId: string, linkData: CreateLinkRequest): Promise<Link> => {
    return fetchApi<Link>(`/users/${userId}/links`, {
      method: 'POST',
      body: JSON.stringify(linkData),
    });
  },

  // SNSアカウント作成
  createSocialAccount: async (userId: string, socialData: CreateSocialAccountRequest): Promise<SocialAccount> => {
    return fetchApi<SocialAccount>(`/users/${userId}/social-accounts`, {
      method: 'POST',
      body: JSON.stringify(socialData),
    });
  },

  // ファイルアップロード用署名URL取得
  getPresignedUrl: async (): Promise<PresignedUrlResponse> => {
    return fetchApi<PresignedUrlResponse>('/files/presign', {
      method: 'POST',
    });
  },

  // ファイルアップロード
  uploadFile: async (file: File): Promise<string> => {
    const { file_key, token } = await apiClient.getPresignedUrl();

    const form = new FormData();
    form.append('token', token);
    form.append('file', file, file.name);

    if (!supabase) {
      throw new ApiError(500, 'Supabase client is not configured');
    }

    // supabase-js を利用して署名付きアップロード
    console.log('[uploadFile] using supabase-js uploadToSignedUrl', {
      bucket: SUPABASE_BUCKET,
      file_key,
      token: token?.slice(0, 10) + '...'
    });

    const { data, error } = await supabase
      .storage
      .from(SUPABASE_BUCKET)
      .uploadToSignedUrl(file_key, token, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (error) {
      console.error('[uploadFile] supabase upload error:', error);
      throw new ApiError(400, `File upload failed: ${error.message}`);
    }

    console.log('[uploadFile] upload done:', data);
    return file_key;
  },

  // 公開URLから Supabase Storage のオブジェクトを削除
  deleteFileByUrl: async (publicUrl: string): Promise<void> => {
    if (!supabase) throw new ApiError(500, 'Supabase client is not configured');
    try {
      const bucket = SUPABASE_BUCKET;
      const marker = `/storage/v1/object/public/${bucket}/`;
      const idx = publicUrl.indexOf(marker);
      if (idx === -1) {
        console.warn('[deleteFileByUrl] not a valid public URL for this bucket:', publicUrl);
        return; // 何もしない
      }
      const key = decodeURIComponent(publicUrl.substring(idx + marker.length));
      const { error } = await supabase.storage.from(bucket).remove([key]);
      if (error) {
        console.warn('[deleteFileByUrl] remove error:', error.message);
      }
    } catch (e) {
      console.warn('[deleteFileByUrl] unexpected error:', e);
    }
  },

  // ログイン
  login: async (loginData: LoginRequest): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  },

  // プロフィール更新
  updateUserProfile: async (userId: string, profileData: UpdateUserProfileRequest): Promise<User> => {
    return fetchApi<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // リンク更新
  updateLink: async (userId: string, linkId: number, linkData: CreateLinkRequest): Promise<Link> => {
    return fetchApi<Link>(`/users/${userId}/links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(linkData),
    });
  },

  // リンク削除
  deleteLink: async (userId: string, linkId: number): Promise<void> => {
    return fetchApi<void>(`/users/${userId}/links/${linkId}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError };