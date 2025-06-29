import { Platform } from 'react-native';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
  displayName: string;
}

export interface ReverseGeocodeResult {
  address: string;
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

class OpenStreetMapService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  private readonly userAgent = 'HomeFood/1.0.0';

  /**
   * Geocode an address to coordinates
   */
  async geocode(address: string): Promise<GeocodeResult[]> {
    try {
      const url = `${this.baseUrl}/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return data.map((item: any) => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        address: this.formatAddress(item.address),
        displayName: item.display_name,
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
    try {
      const url = `${this.baseUrl}/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        address: this.formatAddress(data.address),
        displayName: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        country: data.address?.country,
        postalCode: data.address?.postcode,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        displayName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      };
    }
  }

  /**
   * Search for places near a location
   */
  async searchNearby(
    latitude: number,
    longitude: number,
    query: string,
    radius: number = 5000
  ): Promise<GeocodeResult[]> {
    try {
      const bbox = this.calculateBoundingBox(latitude, longitude, radius);
      const url = `${this.baseUrl}/search?format=json&q=${encodeURIComponent(query)}&viewbox=${bbox}&bounded=1&limit=10&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return data.map((item: any) => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        address: this.formatAddress(item.address),
        displayName: item.display_name,
      }));
    } catch (error) {
      console.error('Nearby search error:', error);
      throw new Error('Failed to search nearby locations');
    }
  }

  /**
   * Get route between two points (basic implementation)
   */
  async getRoute(
    start: LocationCoordinates,
    end: LocationCoordinates
  ): Promise<{
    distance: number;
    duration: number;
    coordinates: LocationCoordinates[];
  }> {
    try {
      // Using OSRM (Open Source Routing Machine) for routing
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: route.distance, // in meters
          duration: route.duration, // in seconds
          coordinates: route.geometry.coordinates.map((coord: number[]) => ({
            longitude: coord[0],
            latitude: coord[1],
          })),
        };
      }
      
      throw new Error('No route found');
    } catch (error) {
      console.error('Routing error:', error);
      throw new Error('Failed to get route');
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(point1: LocationCoordinates, point2: LocationCoordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  /**
   * Format address from Nominatim response
   */
  private formatAddress(address: any): string {
    if (!address) return 'Unknown location';
    
    const parts = [];
    
    // Add house number and street
    if (address.house_number && address.road) {
      parts.push(`${address.house_number} ${address.road}`);
    } else if (address.road) {
      parts.push(address.road);
    }
    
    // Add city/town
    const city = address.city || address.town || address.village || address.municipality;
    if (city) {
      parts.push(city);
    }
    
    // Add state/region
    if (address.state) {
      parts.push(address.state);
    }
    
    // Add postal code
    if (address.postcode) {
      parts.push(address.postcode);
    }
    
    return parts.join(', ') || 'Unknown location';
  }

  /**
   * Calculate bounding box for nearby search
   */
  private calculateBoundingBox(
    latitude: number,
    longitude: number,
    radiusMeters: number
  ): string {
    const latDelta = radiusMeters / 111320; // Approximate meters per degree latitude
    const lonDelta = radiusMeters / (111320 * Math.cos(this.toRadians(latitude)));
    
    const minLon = longitude - lonDelta;
    const minLat = latitude - latDelta;
    const maxLon = longitude + lonDelta;
    const maxLat = latitude + latDelta;
    
    return `${minLon},${minLat},${maxLon},${maxLat}`;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const openStreetMapService = new OpenStreetMapService();