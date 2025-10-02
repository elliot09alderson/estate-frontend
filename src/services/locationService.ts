interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  pincode: string;
  formatted: string;
}

class LocationService {
  private static instance: LocationService;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Get user's current location using browser Geolocation API
  async getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location permission denied. Please enable location access.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable.'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out.'));
              break;
            default:
              reject(new Error('An unknown error occurred.'));
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }

  // Reverse geocode coordinates to get address details
  async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location details');
      }

      const data = await response.json();

      // Extract relevant information
      const address = data.address || {};

      return {
        latitude,
        longitude,
        city: address.city || address.town || address.village || address.suburb || '',
        state: address.state || address.state_district || '',
        country: address.country || '',
        pincode: address.postcode || '',
        formatted: data.display_name || ''
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to get location details');
    }
  }

  // Get user's location and address details
  async getUserLocationData(): Promise<LocationData | null> {
    try {
      const position = await this.getCurrentLocation();
      const { latitude, longitude } = position.coords;
      const locationData = await this.reverseGeocode(latitude, longitude);

      // Store in localStorage for persistent access
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      localStorage.setItem('locationTimestamp', Date.now().toString());

      return locationData;
    } catch (error) {
      console.error('Location service error:', error);

      // Try to get from localStorage if available
      const cached = localStorage.getItem('userLocation');
      if (cached) {
        return JSON.parse(cached);
      }

      return null;
    }
  }

  // Get cached location data
  getCachedLocation(): LocationData | null {
    const cached = localStorage.getItem('userLocation');
    return cached ? JSON.parse(cached) : null;
  }

  // Clear cached location
  clearCachedLocation(): void {
    localStorage.removeItem('userLocation');
    localStorage.removeItem('locationTimestamp');
    localStorage.removeItem('locationPromptShown');
  }

  // Format location for display
  formatLocation(locationData: LocationData): string {
    const parts = [];
    if (locationData.city) parts.push(locationData.city);
    if (locationData.pincode) parts.push(locationData.pincode);
    if (locationData.state) parts.push(locationData.state);

    return parts.join(', ') || 'Unknown location';
  }

  // Calculate distance between two coordinates (in km)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export default LocationService.getInstance();
export type { LocationData };