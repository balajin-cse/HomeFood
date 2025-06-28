import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  isCook: boolean;
  address?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  isCook: boolean;
}

// Mock user database with cook credentials
const MOCK_USERS = [
  {
    id: '1',
    email: 'bala@example.com',
    password: 'pass123',
    name: 'Bala',
    phone: '+1234567890',
    isCook: false,
    address: '123 Main Street, San Francisco, CA 94102',
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  // Cook accounts with ck- prefix and cookpass password
  {
    id: 'ck-maria',
    email: 'ck-maria@homefood.app',
    password: 'cookpass',
    name: 'Maria Rodriguez',
    phone: '+1234567891',
    isCook: true,
    address: '456 North Beach, San Francisco, CA 94133',
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    id: 'ck-sarah',
    email: 'ck-sarah@homefood.app',
    password: 'cookpass',
    name: 'Sarah Johnson',
    phone: '+1234567892',
    isCook: true,
    address: '789 Mission District, San Francisco, CA 94110',
    profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    id: 'ck-david',
    email: 'ck-david@homefood.app',
    password: 'cookpass',
    name: 'David Chen',
    phone: '+1234567893',
    isCook: true,
    address: '321 Chinatown, San Francisco, CA 94108',
    profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    id: 'ck-kenji',
    email: 'ck-kenji@homefood.app',
    password: 'cookpass',
    name: 'Kenji Tanaka',
    phone: '+1234567894',
    isCook: true,
    address: '654 Japantown, San Francisco, CA 94115',
    profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    id: 'ck-elena',
    email: 'ck-elena@homefood.app',
    password: 'cookpass',
    name: 'Elena Papadopoulos',
    phone: '+1234567895',
    isCook: true,
    address: '987 Castro, San Francisco, CA 94114',
    profileImage: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    id: 'ck-marcus',
    email: 'ck-marcus@homefood.app',
    password: 'cookpass',
    name: 'Marcus Campbell',
    phone: '+1234567896',
    isCook: true,
    address: '147 Oakland, CA 94612',
    profileImage: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
];

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
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Find user in mock database
      const foundUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        const user: User = userWithoutPassword;
        
        await AsyncStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === userData.email.toLowerCase()
      );

      if (existingUser) {
        return false; // User already exists
      }

      // Generate cook ID if registering as cook
      const userId = userData.isCook 
        ? `ck-${userData.name.toLowerCase().split(' ')[0]}`
        : Date.now().toString();

      // Generate cook email if registering as cook
      const userEmail = userData.isCook
        ? `ck-${userData.name.toLowerCase().split(' ')[0]}@homefood.app`
        : userData.email;

      // Create new user
      const newUser: User = {
        id: userId,
        email: userEmail,
        name: userData.name,
        phone: userData.phone,
        isCook: userData.isCook,
        profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      };

      // Add to mock database for future logins
      MOCK_USERS.push({
        ...newUser,
        password: userData.isCook ? 'cookpass' : userData.password,
      });
      
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Clear all user-related data
      await AsyncStorage.multiRemove([
        'user',
        'cart',
        'favorites',
        'orderHistory',
        'reportedIssues'
      ]);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if AsyncStorage fails, clear the user state
      setUser(null);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Update profile error:', error);
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