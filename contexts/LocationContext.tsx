import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { openStreetMapService } from '@/services/OpenStreetMapService';

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
  searchLocation: (query: string) => Promise<Array<{
    latitude: number;
    longitude: number;
    address: string;
    displayName: string;
  }>>;
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
        // For web, use browser geolocation API
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setLocation(coords);
              
              try {
                const result = await openStreetMapService.reverseGeocode(coords.latitude, coords.longitude);
                setAddress(result.address);
              } catch (error) {
                console.error('Reverse geocoding error:', error);
                setAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
              }
              setLoading(false);
            },
            (error) => {
              console.error('Geolocation error:', error);
              // Fallback to San Francisco
              setLocation({ latitude: 37.7749, longitude: -122.4194 });
              setAddress('San Francisco, CA');
              setLoading(false);
            }
          );
        } else {
          // Fallback if geolocation is not supported
          setLocation({ latitude: 37.7749, longitude: -122.4194 });
          setAddress('San Francisco, CA');
          setLoading(false);
        }
        return;
      }

      // Request permission for native platforms
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

      // Use OpenStreetMap for reverse geocoding
      try {
        const result = await openStreetMapService.reverseGeocode(coords.latitude, coords.longitude);
        setAddress(result.address);
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback to Expo Location reverse geocoding
        try {
          const reverseGeocode = await Location.reverseGeocodeAsync(coords);
          if (reverseGeocode.length > 0) {
            const result = reverseGeocode[0];
            const formattedAddress = `${result.street || ''} ${result.city || ''}, ${result.region || ''} ${result.postalCode || ''}`.trim();
            setAddress(formattedAddress || 'Unknown location');
          } else {
            setAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
          }
        } catch (fallbackError) {
          console.error('Fallback reverse geocoding error:', fallbackError);
          setAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        }
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

  const searchLocation = async (query: string) => {
    try {
      return await openStreetMapService.geocode(query);
    } catch (error) {
      console.error('Location search error:', error);
      return [];
    }
  };

  return (
    <LocationContext.Provider value={{
      location,
      address,
      loading,
      refreshLocation,
      updateLocation,
      searchLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
};