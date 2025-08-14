import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (to be generated from Supabase)
export interface User {
  id: string;
  auth_uid?: string;
  name: string;
  user_name: string;
  biography?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: number;
  user_id: string;
  title: string;
  url: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: number;
  user_id: string;
  platform: 'youtube' | 'x' | 'twitch' | 'github' | 'instagram' | 'facebook';
  url: string;
  created_at: string;
  updated_at: string;
}