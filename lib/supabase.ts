import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// Enhanced validation with detailed logging
const isValidUrl = (url: string | undefined): boolean => {
  console.log('🔍 Validating Supabase URL:', url ? url.substring(0, 30) + '...' : 'undefined');
  if (!url) {
    console.log('❌ No Supabase URL provided');
    return false;
  }
  if (url.includes('your_supabase_project_url_here') || url.includes('mock')) {
    console.log('❌ Placeholder Supabase URL detected');
    return false;
  }
  try {
    new URL(url);
    console.log('✅ Valid Supabase URL format');
    return true;
  } catch (error) {
    console.log('❌ Invalid URL format:', error);
    return false;
  }
};

const isValidKey = (key: string | undefined): boolean => {
  console.log('🔍 Validating Supabase key length:', key?.length || 0);
  const isValid = !!(key && key !== 'your_supabase_anon_key_here' && key.length > 10 && !key.includes('mock'));
  console.log(isValid ? '✅ Valid Supabase key format' : '❌ Invalid Supabase key format');
  return isValid;
};

// Create a mock client for development when Supabase is not configured
const createMockClient = () => {
  console.warn('🔧 Using mock Supabase client - authentication will fail');
  return {
    auth: {
      signInWithPassword: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { message: 'Supabase not configured - using mock client', code: 'mock_error' } 
      }),
      signUp: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { message: 'Supabase not configured - using mock client', code: 'mock_error' } 
      }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    // Real-time methods
    channel: (name: string) => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {},
    }),
    removeAllChannels: () => {},
    getChannels: () => [],
    removeChannel: () => {},
    from: () => ({
      select: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured', code: 'mock_error' } }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured', code: 'mock_error' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured', code: 'mock_error' } }),
      upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured', code: 'mock_error' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured', code: 'mock_error' } }),
      single: function() { return this; },
      eq: function() { return this; },
      order: function() { return this; },
    }),
  };
};

export const supabase = (() => {
  console.log('🚀 Initializing Supabase client...');
  console.log('📋 Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
  });

  if (!isValidUrl(supabaseUrl) || !isValidKey(supabaseAnonKey)) {
    console.error(
      '❌ Supabase configuration is missing or invalid.\n' +
      'Please ensure your .env file contains valid EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY\n' +
      'The app will use mock data until properly configured.'
    );
    return createMockClient() as any;
  }

  console.log('✅ Creating real Supabase client with valid configuration');
  
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    
    // Add the removeAllChannels method to prevent errors
    if (!client.removeAllChannels) {
      client.removeAllChannels = () => {
        console.log('🧹 Removing all Supabase channels');
        const channels = client.getChannels();
        channels.forEach(channel => {
          client.removeChannel(channel);
        });
      };
    }
    
    console.log('🎉 Supabase client initialized successfully');
    return client;
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    return createMockClient() as any;
  }
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