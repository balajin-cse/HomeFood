import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

interface LocationContextType {
  location: any | null;
  address: string | null;
  loading: boolean;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<any | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      if (Platform.OS === 'web') {
        // For web, use a mock location
        setAddress('San Francisco, CA');
        setLoading(false);
        return;
      }

      // For native platforms, we would use expo-location here
      // But since we're focusing on web compatibility, we'll use mock data
      setAddress('San Francisco, CA');
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setAddress('Location not available');
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    await getCurrentLocation();
  };

  return (
    <LocationContext.Provider value={{
      location,
      address,
      loading,
      refreshLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
};