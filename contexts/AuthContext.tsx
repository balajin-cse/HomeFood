import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Platform } from 'react-native';

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
  createTestUsers: () => Promise<{ success: boolean; error?: string }>;
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
    let mounted = true;

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          console.log('👤 Found existing session for:', session.user.email);
          await loadUserProfile(session.user);
        } else {
          console.log('❌ No existing session found');
        }
      } catch (error) {
        console.error('❌ Error checking session:', error);
        
        // Handle invalid refresh token error
        if (error instanceof Error && error.message === 'SUPABASE_AUTH_REFRESH_TOKEN_INVALID') {
          console.warn('🔄 Invalid refresh token detected during initialization, clearing session');
          await logout();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user');
      
      if (!mounted) return;

      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('👤 Loading profile for user:', supabaseUser.email);
      
      // Wait a moment for profile creation trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('❌ Error loading profile:', error.message);
        
        // If profile doesn't exist, try to create it manually
        if (error.code === 'PGRST116') {
          console.log('📝 Profile not found, creating new profile...');
          await createUserProfile(supabaseUser);
          return;
        }
        
        // For other errors, create a fallback user object
        console.log('⚠️ Using fallback user data');
        const fallbackUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
          phone: supabaseUser.user_metadata?.phone || null,
          isCook: supabaseUser.user_metadata?.is_cook || false,
        };
        setUser(fallbackUser);
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
        console.log('✅ Profile loaded successfully:', { 
          email: user.email, 
          name: user.name, 
          isCook: user.isCook 
        });
        setUser(user);
      }
    } catch (err) {
      console.error('❌ Exception loading user profile:', err);
      
      // Create fallback user to prevent auth failure
      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
        phone: supabaseUser.user_metadata?.phone || null,
        isCook: supabaseUser.user_metadata?.is_cook || false,
      };
      setUser(fallbackUser);
    }
  };

  const createUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('📝 Creating profile for user:', supabaseUser.email);
      
      const profileData = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
        phone: supabaseUser.user_metadata?.phone || null,
        is_cook: supabaseUser.user_metadata?.is_cook || false,
        profile_image: supabaseUser.user_metadata?.is_cook ? 
          'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' :
          'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      };

      const { error } = await supabase
        .from('profiles')
        .insert(profileData);

      if (error) {
        console.error('❌ Error creating profile:', error.message);
        
        // If it's a unique constraint error, the profile already exists
        if (error.code === '23505') {
          console.log('⚠️ Profile already exists, loading existing profile...');
          await loadUserProfile(supabaseUser);
          return;
        }
        
        // For other errors, create a basic user object
        const basicUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: profileData.name,
          phone: profileData.phone,
          isCook: profileData.is_cook,
        };
        setUser(basicUser);
        return;
      }

      console.log('✅ Profile created successfully');
      await loadUserProfile(supabaseUser);
    } catch (err) {
      console.error('❌ Exception creating profile:', err);
      
      // Fallback user creation
      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
        phone: supabaseUser.user_metadata?.phone || null,
        isCook: supabaseUser.user_metadata?.is_cook || false,
      };
      setUser(fallbackUser);
    }
  };

  const createTestUsers = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🧪 Creating test users via registration...');
      
      // Create customer test user
      console.log('📝 Creating customer user: bala@example.com');
      const customerResult = await supabase.auth.signUp({
        email: 'bala@example.com',
        password: 'pass123',
        options: {
          data: {
            name: 'Bala',
            phone: '+1234567890',
            is_cook: false,
          },
        },
      });

      if (customerResult.error && !customerResult.error.message.includes('already registered')) {
        console.error('❌ Error creating customer user:', customerResult.error.message);
      } else {
        console.log('✅ Customer test user handled');
      }

      // Create cook test user
      console.log('📝 Creating cook user: ck-cookname@homefood.app');
      const cookResult = await supabase.auth.signUp({
        email: 'ck-cookname@homefood.app',
        password: 'cookpass',
        options: {
          data: {
            name: 'Cook Name',
            phone: '+1234567891',
            is_cook: true,
          },
        },
      });

      if (cookResult.error && !cookResult.error.message.includes('already registered')) {
        console.error('❌ Error creating cook user:', cookResult.error.message);
      } else {
        console.log('✅ Cook test user handled');
      }

      return { success: true };
    } catch (error: any) {
      console.error('❌ Error creating test users:', error);
      return { success: false, error: error.message };
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
        
        // If credentials are invalid and it's one of our test accounts, try to create them
        if (error.message.includes('Invalid login credentials') && 
            (email === 'bala@example.com' || email === 'ck-cookname@homefood.app')) {
          console.log('🧪 Test user not found, creating test users...');
          
          const testUserResult = await createTestUsers();
          if (testUserResult.success) {
            console.log('🔄 Retrying login after test user creation...');
            
            // Wait a moment for the database to sync
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const retryResult = await supabase.auth.signInWithPassword({
              email: email.trim().toLowerCase(),
              password,
            });

            if (retryResult.error) {
              return { success: false, error: 'Invalid email or password. Please check your credentials and try again.' };
            }

            if (retryResult.data.user) {
              console.log('✅ Login successful after creating test users for:', retryResult.data.user.email);
              return { success: true };
            }
          }
        }
        
        // Provide user-friendly error messages
        let userFriendlyError = 'Invalid email or password. Please check your credentials and try again.';
        if (error.message.includes('Email not confirmed')) {
          userFriendlyError = 'Please check your email and click the confirmation link before logging in.';
        } else if (error.message.includes('Supabase not configured')) {
          userFriendlyError = 'The app is not properly configured. Please check your environment variables.';
        }
        
        return { success: false, error: userFriendlyError };
      }

      if (data.user) {
        console.log('✅ Login successful for user:', data.user.email);
        // Profile will be loaded automatically via the auth state change listener
        return { success: true };
      }
      
      return { success: false, error: 'Login failed - no user returned' };
    } catch (error: any) {
      console.error('❌ Login exception:', error);
      
      // Handle invalid refresh token error
      if (error instanceof Error && error.message === 'SUPABASE_AUTH_REFRESH_TOKEN_INVALID') {
        console.warn('🔄 Invalid refresh token detected during login, clearing session');
        await logout();
        return { success: false, error: 'Your session has expired. Please try logging in again.' };
      }
      
      return { success: false, error: error.message || 'An unexpected error occurred during login' };
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
        } else if (error.message.includes('Password should be')) {
          return { success: false, error: 'Password must be at least 6 characters long.' };
        } else if (error.message.includes('invalid email')) {
          return { success: false, error: 'Please enter a valid email address.' };
        } else if (error.message.includes('Supabase not configured')) {
          return { success: false, error: 'The app is not properly configured. Please check your environment variables.' };
        }
        
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Registration successful for user:', data.user.email);
        
        // Check if email confirmation is required
        if (!data.session) {
          return { 
            success: true, 
            error: 'Registration successful! Please check your email for a confirmation link before logging in.' 
          };
        }
        
        // If there's a session, the user is automatically logged in
        return { success: true };
      }
      
      return { success: false, error: 'Registration failed - no user returned' };
    } catch (error: any) {
      console.error('❌ Registration exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred during registration' };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user');
      
      // First, clear the user state to immediately update the UI
      setUser(null);
      
      // Then perform the actual logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Logout error:', error);
        
        // For web platform, try to clear localStorage as a fallback
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          try {
            localStorage.removeItem('supabase.auth.token');
            console.log('✅ Manually cleared auth token from localStorage');
          } catch (storageError) {
            console.error('❌ Failed to clear localStorage:', storageError);
          }
        }
      } else {
        console.log('✅ Logout successful');
      }
      
      // Force clear AsyncStorage auth data for mobile platforms
      if (Platform.OS !== 'web') {
        try {
          await AsyncStorage.removeItem('supabase.auth.token');
          console.log('✅ Cleared auth token from AsyncStorage');
        } catch (storageError) {
          console.error('❌ Failed to clear AsyncStorage:', storageError);
        }
      }
    } catch (error) {
      console.error('❌ Logout exception:', error);
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
      createTestUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
};