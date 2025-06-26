import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

interface LocationContextType {
  location: Location.LocationObject | null;
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
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
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

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        setAddress('Location not available');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        const formattedAddress = `${addr.street || ''} ${addr.city || ''}, ${addr.region || ''}`;
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setAddress('Location not available');
    } finally {
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