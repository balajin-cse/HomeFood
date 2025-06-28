import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  isCook: boolean;
  address?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  isCook: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('👤 Loading profile for user:', supabaseUser.email);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('❌ Error loading profile:', error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('📝 Profile not found, creating new profile...');
          await createUserProfile(supabaseUser);
          return;
        }
        return;
      }

      if (profile) {
        const user: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          isCook: profile.is_cook,
          address: profile.address || undefined,
          profileImage: profile.profile_image || undefined,
        };
        console.log('✅ Profile loaded successfully');
        setUser(user);
      }
    } catch (err) {
      console.error('❌ Exception loading user profile:', err);
    }
  };

  const createUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
          phone: supabaseUser.user_metadata?.phone || null,
          is_cook: supabaseUser.user_metadata?.is_cook || false,
          profile_image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        });

      if (error) {
        console.error('❌ Error creating profile:', error);
        return;
      }

      console.log('✅ Profile created successfully');
      await loadUserProfile(supabaseUser);
    } catch (err) {
      console.error('❌ Exception creating profile:', err);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔑 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Login successful for user:', data.user.email);
        return { success: true };
      }
      
      return { success: false, error: 'Login failed - no user returned' };
    } catch (error: any) {
      console.error('❌ Login exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            is_cook: userData.isCook,
          },
        },
      });

      if (error) {
        console.error('❌ Registration error:', error.message);
        
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          return { success: false, error: 'This email is already registered. Please try logging in instead.' };
        }
        
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Registration successful for user:', data.user.email);
        
        // Check if email confirmation is required
        if (!data.session) {
          return { 
            success: true, 
            error: 'Please check your email for a confirmation link before logging in.' 
          };
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'Registration failed - no user returned' };
    } catch (error: any) {
      console.error('❌ Registration exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Logout error:', error);
      } else {
        console.log('✅ Logout successful');
      }
    } catch (error) {
      console.error('❌ Logout exception:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!user) {
        console.error('❌ No user to update');
        return;
      }

      console.log('🔄 Updating profile for user:', user.id);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          profile_image: userData.profileImage,
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Profile update error:', error);
        return;
      }

      console.log('✅ Profile updated successfully');
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    } catch (error) {
      console.error('❌ Update profile exception:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};