import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
  
  // Storage for mock auth state
  let mockUser: any = null;
  let mockSession: any = null;
  const authListeners: Array<(event: string, session: any) => void> = [];
  
  return {
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        console.log('🔐 Mock sign in attempt:', email);
        
        // Simple mock authentication logic
        if ((email === 'bala@example.com' && password === 'pass123') || 
            (email.includes('ck-') && password === 'cookpass')) {
          
          mockUser = {
            id: `mock-${Date.now()}`,
            email,
            user_metadata: {
              name: email === 'bala@example.com' ? 'Bala' : 'Cook Name',
              is_cook: email.includes('ck-')
            }
          };
          
          mockSession = {
            user: mockUser,
            access_token: 'mock-token'
          };
          
          // Notify listeners
          setTimeout(() => {
            authListeners.forEach(listener => listener('SIGNED_IN', mockSession));
          }, 100);
          
          return { data: { user: mockUser, session: mockSession }, error: null };
        }
        
        return { 
          data: { user: null, session: null }, 
          error: { message: 'Invalid login credentials', code: 'mock_error' } 
        };
      },
      
      signUp: async ({ email, password, options }: any) => {
        console.log('📝 Mock sign up attempt:', email);
        
        mockUser = {
          id: `mock-${Date.now()}`,
          email,
          user_metadata: options?.data || {}
        };
        
        mockSession = {
          user: mockUser,
          access_token: 'mock-token'
        };
        
        // Notify listeners
        setTimeout(() => {
          authListeners.forEach(listener => listener('SIGNED_IN', mockSession));
        }, 100);
        
        return { data: { user: mockUser, session: mockSession }, error: null };
      },
      
      signOut: async () => {
        console.log('🚪 Mock sign out');
        
        // Clear mock auth state
        mockUser = null;
        mockSession = null;
        
        // Notify listeners
        setTimeout(() => {
          authListeners.forEach(listener => listener('SIGNED_OUT', null));
        }, 100);
        
        return { error: null };
      },
      
      getSession: async () => {
        return { data: { session: mockSession }, error: null };
      },
      
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        authListeners.push(callback);
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => {
                const index = authListeners.indexOf(callback);
                if (index > -1) {
                  authListeners.splice(index, 1);
                }
              } 
            } 
          } 
        };
      },
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
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
          then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback),
        }),
        order: () => ({
          then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback),
        }),
        then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        then: (callback: any) => Promise.resolve({ data: null, error: null }).then(callback),
      }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
        then: (callback: any) => Promise.resolve({ data: null, error: null }).then(callback),
      }),
      upsert: () => Promise.resolve({ data: null, error: null }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
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
    // Custom fetch function to handle refresh token errors
    const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
      const response = await fetch(url, options);
      
      // Check if this is a refresh token error
      if (!response.ok && response.status === 400) {
        try {
          const errorData = await response.clone().json();
          if (errorData.code === 'refresh_token_not_found') {
            console.warn('🔄 Invalid refresh token detected, will clear session');
            throw new Error('SUPABASE_AUTH_REFRESH_TOKEN_INVALID');
          }
        } catch (parseError) {
          // If we can't parse the error, continue with normal response
          if (parseError instanceof Error && parseError.message === 'SUPABASE_AUTH_REFRESH_TOKEN_INVALID') {
            throw parseError;
          }
        }
      }
      
      return response;
    };

    // Create a custom storage adapter for web platform
    const createCustomStorage = () => {
      // For web platform, create a wrapper around localStorage with additional error handling
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return {
          getItem: async (key: string): Promise<string | null> => {
            try {
              return localStorage.getItem(key);
            } catch (error) {
              console.error('Storage getItem error:', error);
              return null;
            }
          },
          setItem: async (key: string, value: string): Promise<void> => {
            try {
              localStorage.setItem(key, value);
            } catch (error) {
              console.error('Storage setItem error:', error);
            }
          },
          removeItem: async (key: string): Promise<void> => {
            try {
              localStorage.removeItem(key);
            } catch (error) {
              console.error('Storage removeItem error:', error);
            }
          }
        };
      }
      
      // For native platforms, use AsyncStorage
      return AsyncStorage;
    };

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: createCustomStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
      global: {
        fetch: customFetch,
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