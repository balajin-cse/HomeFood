import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

// Enhanced validation with detailed logging
const isValidUrl = (url: string | undefined): boolean => {
  console.log('Validating Supabase URL:', url);
  if (!url) {
    console.log('❌ No Supabase URL provided');
    return false;
  }
  if (url.includes('your-project-ref') || url === 'https://demo.supabase.co') {
    console.log('❌ Placeholder Supabase URL detected');
    return false;
  }
  try {
    new URL(url);
    console.log('✅ Valid Supabase URL');
    return true;
  } catch (error) {
    console.log('❌ Invalid URL format:', error);
    return false;
  }
};

const isValidKey = (key: string | undefined): boolean => {
  console.log('Validating Supabase key length:', key?.length);
  const isValid = !!(key && key !== 'your-anon-key-here' && key !== 'demo-key' && key.length > 10);
  console.log(isValid ? '✅ Valid Supabase key' : '❌ Invalid Supabase key');
  return isValid;
};

// Create a mock client with working authentication for demo purposes
const createMockClient = () => {
  console.log('🔧 Using mock Supabase client with demo authentication');
  
  // Mock users database
  const MOCK_USERS = [
    {
      id: 'user-bala-123',
      email: 'bala@example.com',
      password: 'pass123',
      user_metadata: {
        name: 'Bala',
        phone: '+1234567890',
        is_cook: false,
      },
    },
    {
      id: 'cook-123',
      email: 'ck-cookname@homefood.app',
      password: 'cookpass',
      user_metadata: {
        name: 'Cook Name',
        phone: '+1234567891',
        is_cook: true,
      },
    },
  ];

  let currentUser: any = null;
  let currentSession: any = null;
  const authListeners: Array<(event: string, session: any) => void> = [];

  return {
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        console.log('🔐 Mock sign in attempt:', email);
        const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (user) {
          currentUser = {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
          };
          currentSession = {
            user: currentUser,
            access_token: 'mock-token',
          };
          
          console.log('✅ Mock sign in successful');
          
          // Notify listeners
          setTimeout(() => {
            authListeners.forEach(listener => listener('SIGNED_IN', currentSession));
          }, 100);
          
          return { data: { user: currentUser, session: currentSession }, error: null };
        } else {
          console.log('❌ Mock sign in failed');
          return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } };
        }
      },
      
      signUp: async ({ email, password, options }: any) => {
        console.log('📝 Mock sign up attempt:', email);
        
        // Check if user already exists
        const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
          return { data: { user: null, session: null }, error: { message: 'User already exists' } };
        }
        
        // Create new user
        const newUser = {
          id: `user-${Date.now()}`,
          email,
          password,
          user_metadata: options?.data || {},
        };
        
        MOCK_USERS.push(newUser);
        currentUser = {
          id: newUser.id,
          email: newUser.email,
          user_metadata: newUser.user_metadata,
        };
        currentSession = {
          user: currentUser,
          access_token: 'mock-token',
        };
        
        console.log('✅ Mock sign up successful');
        
        // Notify listeners
        setTimeout(() => {
          authListeners.forEach(listener => listener('SIGNED_IN', currentSession));
        }, 100);
        
        return { data: { user: currentUser, session: currentSession }, error: null };
      },
      
      signOut: async () => {
        console.log('👋 Mock sign out');
        currentUser = null;
        currentSession = null;
        
        // Notify listeners
        setTimeout(() => {
          authListeners.forEach(listener => listener('SIGNED_OUT', null));
        }, 100);
        
        return { error: null };
      },
      
      getSession: async () => {
        return { data: { session: currentSession }, error: null };
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
    from: (table: string) => ({
      select: (columns?: string) => {
        const query = {
          eq: function(column: string, value: any) { return this; },
          order: function(column: string, options?: any) { return this; },
          single: function() { 
            // Mock profile data based on current user
            if (table === 'profiles' && currentUser) {
              const profileData = {
                id: currentUser.id,
                email: currentUser.email,
                name: currentUser.user_metadata?.name || 'User',
                phone: currentUser.user_metadata?.phone || null,
                is_cook: currentUser.user_metadata?.is_cook || false,
                address: null,
                profile_image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              return Promise.resolve({ data: profileData, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          },
          then: function(callback: any) {
            return Promise.resolve({ data: [], error: null }).then(callback);
          },
        };
        return query;
      },
      insert: (data: any) => {
        const query = {
          select: function() { return this; },
          single: function() { 
            // Mock insert with generated ID
            const insertedData = { ...data, id: `${table}-${Date.now()}` };
            return Promise.resolve({ data: insertedData, error: null });
          },
          then: function(callback: any) {
            return Promise.resolve({ data: null, error: null }).then(callback);
          },
        };
        return query;
      },
      update: (data: any) => {
        const query = {
          eq: function(column: string, value: any) { return this; },
          then: function(callback: any) {
            return Promise.resolve({ data: null, error: null }).then(callback);
          },
        };
        return query;
      },
      delete: () => {
        const query = {
          eq: function(column: string, value: any) { return this; },
          then: function(callback: any) {
            return Promise.resolve({ data: null, error: null }).then(callback);
          },
        };
        return query;
      },
      eq: function() { return this; },
      order: function() { return this; },
    }),
  };
};

export const supabase = (() => {
  console.log('🔧 Initializing Supabase client...');
  console.log('Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlValid: isValidUrl(supabaseUrl),
    keyValid: isValidKey(supabaseAnonKey)
  });

  if (!isValidUrl(supabaseUrl) || !isValidKey(supabaseAnonKey)) {
    console.warn(
      '❌ Supabase configuration is missing or invalid. Please check your environment variables.\n' +
      `URL: ${supabaseUrl}\n` +
      `Key length: ${supabaseAnonKey?.length}\n` +
      'The app will use mock data until properly configured.'
    );
    return createMockClient() as any;
  }

  console.log('✅ Creating real Supabase client');
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