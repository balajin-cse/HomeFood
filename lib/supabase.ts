import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
const isValidUrl = (url: string | undefined): boolean => {
  if (!url || url.includes('your_supabase_project_url_here')) {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidKey = (key: string | undefined): boolean => {
  return !!(key && key !== 'your_supabase_anon_key_here' && key.length > 10);
};

// Create a mock client for development when Supabase is not configured
const createMockClient = () => ({
  auth: {
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
  }),
});

export const supabase = (() => {
  if (!isValidUrl(supabaseUrl) || !isValidKey(supabaseAnonKey)) {
    console.warn(
      'Supabase configuration is missing or invalid. Please set up your Supabase connection. ' +
      'The app will use mock data until properly configured.'
    );
    return createMockClient() as any;
  }

  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
})();

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          is_cook: boolean;
          address: string | null;
          profile_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string | null;
          is_cook?: boolean;
          address?: string | null;
          profile_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          is_cook?: boolean;
          address?: string | null;
          profile_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          tracking_number: string;
          customer_id: string | null;
          cook_id: string | null;
          status: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
          total_amount: number;
          delivery_address: string;
          delivery_instructions: string | null;
          estimated_delivery_time: string | null;
          actual_delivery_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tracking_number: string;
          customer_id?: string | null;
          cook_id?: string | null;
          status?: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
          total_amount: number;
          delivery_address: string;
          delivery_instructions?: string | null;
          estimated_delivery_time?: string | null;
          actual_delivery_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tracking_number?: string;
          customer_id?: string | null;
          cook_id?: string | null;
          status?: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
          total_amount?: number;
          delivery_address?: string;
          delivery_instructions?: string | null;
          estimated_delivery_time?: string | null;
          actual_delivery_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          food_id: string;
          food_title: string;
          food_description: string | null;
          food_image: string | null;
          price: number;
          quantity: number;
          special_instructions: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          food_id: string;
          food_title: string;
          food_description?: string | null;
          food_image?: string | null;
          price: number;
          quantity?: number;
          special_instructions?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          food_id?: string;
          food_title?: string;
          food_description?: string | null;
          food_image?: string | null;
          price?: number;
          quantity?: number;
          special_instructions?: string | null;
        };
      };
      menu_items: {
        Row: {
          id: string;
          cook_id: string;
          title: string;
          description: string | null;
          price: number;
          image: string | null;
          meal_type: 'breakfast' | 'lunch' | 'dinner';
          available_quantity: number;
          tags: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cook_id: string;
          title: string;
          description?: string | null;
          price: number;
          image?: string | null;
          meal_type?: 'breakfast' | 'lunch' | 'dinner';
          available_quantity?: number;
          tags?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cook_id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          image?: string | null;
          meal_type?: 'breakfast' | 'lunch' | 'dinner';
          available_quantity?: number;
          tags?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}