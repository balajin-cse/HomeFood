import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  location: LocationData | null;
  address: string | null;
  loading: boolean;
  refreshLocation: () => Promise<void>;
  updateLocation: (location: LocationData, address: string) => void;
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
  const [location, setLocation] = useState<LocationData | null>(null);
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
        setLocation({ latitude: 37.7749, longitude: -122.4194 });
        setAddress('San Francisco, CA');
        setLoading(false);
        return;
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        setAddress('Location permission denied');
        setLoading(false);
        return;
      }

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(coords);

      // Reverse geocode to get address
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync(coords);
        if (reverseGeocode.length > 0) {
          const result = reverseGeocode[0];
          const formattedAddress = `${result.street || ''} ${result.city || ''}, ${result.region || ''} ${result.postalCode || ''}`.trim();
          setAddress(formattedAddress || 'Unknown location');
        } else {
          setAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        }
      } catch (geocodeError) {
        console.error('Reverse geocoding error:', geocodeError);
        setAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
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

  const updateLocation = (newLocation: LocationData, newAddress: string) => {
    setLocation(newLocation);
    setAddress(newAddress);
  };

  return (
    <LocationContext.Provider value={{
      location,
      address,
      loading,
      refreshLocation,
      updateLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
};