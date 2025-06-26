import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { MapPin, Navigation, Search, X } from 'lucide-react-native';
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
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    latitude: initialLocation?.latitude || 37.7749,
    longitude: initialLocation?.longitude || -122.4194,
  });

  useEffect(() => {
    if (!initialLocation) {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, use browser geolocation API
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setMapCenter(coords);
              const address = await reverseGeocode(coords.latitude, coords.longitude);
              setSelectedLocation({ ...coords, address });
            },
            (error) => {
              console.error('Geolocation error:', error);
              Alert.alert('Error', 'Could not get your current location.');
            }
          );
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setMapCenter(coords);
      
      // Get address for current location
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      setSelectedLocation({ ...coords, address });
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Could not get your current location.');
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      if (Platform.OS === 'web') {
        // Use Nominatim API for reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
        );
        const data = await response.json();
        return data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      } else {
        // Use Expo Location for native platforms
        const result = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (result.length > 0) {
          const location = result[0];
          return `${location.street || ''} ${location.city || ''}, ${location.region || ''} ${location.postalCode || ''}`.trim();
        }
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      if (Platform.OS === 'web') {
        // Use Nominatim API for geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        );
        const data = await response.json();
        if (data.length > 0) {
          return {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          };
        }
      } else {
        // Use Expo Location for native platforms
        const results = await Location.geocodeAsync(address);
        if (results.length > 0) {
          return {
            latitude: results[0].latitude,
            longitude: results[0].longitude,
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const coords = await geocodeAddress(searchQuery);
      if (coords) {
        setMapCenter(coords);
        const address = await reverseGeocode(coords.latitude, coords.longitude);
        setSelectedLocation({ ...coords, address });
      } else {
        Alert.alert('Not found', 'Could not find the specified location.');
      }
    } catch (error) {
      console.error('Search error:', error);
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

  // Generate OpenStreetMap HTML
  const generateMapHTML = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OpenStreetMap</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100%; }
            .custom-marker {
                background-color: #FF6B35;
                border: 3px solid white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map').setView([${mapCenter.latitude}, ${mapCenter.longitude}], 15);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            var marker = null;
            
            // Add initial marker if location is selected
            ${selectedLocation ? `
            marker = L.marker([${selectedLocation.latitude}, ${selectedLocation.longitude}], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(map);
            ` : ''}
            
            map.on('click', function(e) {
                var lat = e.latlng.lat;
                var lng = e.latlng.lng;
                
                if (marker) {
                    map.removeLayer(marker);
                }
                
                marker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'custom-marker',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                }).addTo(map);
                
                // Send location to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'locationSelected',
                    latitude: lat,
                    longitude: lng
                }));
            });
            
            // Listen for center updates
            window.addEventListener('message', function(event) {
                try {
                    var data = JSON.parse(event.data);
                    if (data.type === 'updateCenter') {
                        map.setView([data.latitude, data.longitude], 15);
                        
                        if (marker) {
                            map.removeLayer(marker);
                        }
                        
                        marker = L.marker([data.latitude, data.longitude], {
                            icon: L.divIcon({
                                className: 'custom-marker',
                                iconSize: [20, 20],
                                iconAnchor: [10, 10]
                            })
                        }).addTo(map);
                    }
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            });
        </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelected') {
        setLoading(true);
        const address = await reverseGeocode(data.latitude, data.longitude);
        setSelectedLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          address,
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
      setLoading(false);
    }
  };

  // Update map center when search results change
  useEffect(() => {
    if (Platform.OS === 'web') {
      // For web, we can post a message to update the map
      const webView = document.querySelector('iframe');
      if (webView && webView.contentWindow) {
        webView.contentWindow.postMessage(JSON.stringify({
          type: 'updateCenter',
          latitude: mapCenter.latitude,
          longitude: mapCenter.longitude
        }), '*');
      }
    }
  }, [mapCenter]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Select Location</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

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
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: generateMapHTML() }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>

      {/* Location Info */}
      {selectedLocation && (
        <View style={styles.locationInfo}>
          <View style={styles.locationDetails}>
            <MapPin size={20} color={theme.colors.primary} />
            <View style={styles.locationText}>
              <Text style={styles.locationTitle}>Selected Location</Text>
              <Text style={styles.locationAddress} numberOfLines={2}>
                {selectedLocation.address}
              </Text>
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
          <Text style={styles.currentLocationText}>Use Current Location</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
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
  mapContainer: {
    flex: 1,
  },
  webView: {
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
    alignItems: 'flex-start',
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
    lineHeight: 16,
  },
  controls: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    gap: theme.spacing.md,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: theme.spacing.sm,
  },
  currentLocationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
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
});