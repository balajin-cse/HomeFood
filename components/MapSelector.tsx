import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Navigation, Search } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { theme } from '@/constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MapSelectorProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  onClose: () => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export function MapSelector({ onLocationSelect, onClose, initialLocation }: MapSelectorProps) {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude || 37.7749,
    longitude: initialLocation?.longitude || -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      
      // Get address for current location
      const address = await reverseGeocode(location.coords.latitude, location.coords.longitude);
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Could not get your current location.');
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const location = result[0];
        return `${location.street || ''} ${location.city || ''}, ${location.region || ''} ${location.postalCode || ''}`.trim();
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLoading(true);
    
    try {
      const address = await reverseGeocode(latitude, longitude);
      setSelectedLocation({ latitude, longitude, address });
    } catch (error) {
      console.error('Error getting address:', error);
      setSelectedLocation({
        latitude,
        longitude,
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const location = results[0];
        const newRegion = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
        
        const address = await reverseGeocode(location.latitude, location.longitude);
        setSelectedLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          address,
        });
      } else {
        Alert.alert('Not found', 'Could not find the specified location.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Could not search for the location.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  const handleUseCurrentLocation = () => {
    getCurrentLocation();
  };

  // For web platform, show a placeholder
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webHeader}>
          <Text style={styles.webTitle}>Map Location Selector</Text>
          <TouchableOpacity onPress={onClose} style={styles.webCloseButton}>
            <Text style={styles.webCloseText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.webMapPlaceholder}>
          <MapPin size={48} color={theme.colors.primary} />
          <Text style={styles.webPlaceholderTitle}>Interactive Map</Text>
          <Text style={styles.webPlaceholderText}>
            Google Maps integration is available on mobile devices.
            For web demo, we'll use a simulated location.
          </Text>
        </View>
        
        <View style={styles.webControls}>
          <Input
            placeholder="Search for an address..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.webSearchInput}
          />
          
          <Button
            title="Use Demo Location"
            onPress={() => {
              onLocationSelect({
                latitude: 37.7749,
                longitude: -122.4194,
                address: searchQuery || 'San Francisco, CA',
              });
            }}
            style={styles.webButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.colors.onSurfaceVariant} style={styles.searchIcon} />
          <Input
            placeholder="Search for an address..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            onSubmitEditing={handleSearch}
          />
        </View>
        <Button
          title="Search"
          onPress={handleSearch}
          disabled={loading}
          size="small"
          style={styles.searchButton}
        />
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        mapType="standard"
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Selected Location"
            description={selectedLocation.address}
          />
        )}
      </MapView>

      {/* Location Info */}
      {selectedLocation && (
        <View style={styles.locationInfo}>
          <View style={styles.locationDetails}>
            <MapPin size={20} color={theme.colors.primary} />
            <View style={styles.locationText}>
              <Text style={styles.locationTitle}>Selected Location</Text>
              <Text style={styles.locationAddress}>{selectedLocation.address}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}
        >
          <Navigation size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.actionButtons}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            style={styles.cancelButton}
          />
          <Button
            title="Confirm Location"
            onPress={handleConfirmLocation}
            disabled={!selectedLocation || loading}
            style={styles.confirmButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    gap: theme.spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: theme.spacing.md,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 48,
    marginBottom: 0,
  },
  searchButton: {
    minWidth: 80,
  },
  map: {
    flex: 1,
  },
  locationInfo: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  locationText: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  locationAddress: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  controls: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  currentLocationButton: {
    position: 'absolute',
    top: -60,
    right: theme.spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
  // Web-specific styles
  webContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  webHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  webTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  webCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webCloseText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  webMapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceVariant,
  },
  webPlaceholderTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  webPlaceholderText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  webControls: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    gap: theme.spacing.md,
  },
  webSearchInput: {
    marginBottom: 0,
  },
  webButton: {
    alignSelf: 'center',
  },
});