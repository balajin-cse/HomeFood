import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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