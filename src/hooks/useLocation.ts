import { useState, useEffect } from 'react';
import locationService, { LocationData } from '@/services/locationService';

interface UseLocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  showPrompt: boolean;
  hasAskedPermission: boolean;
  requestLocation: () => Promise<void>;
  skipLocation: () => void;
  clearLocation: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasAskedPermission, setHasAskedPermission] = useState(false);

  useEffect(() => {
    // Check if we have cached location data in localStorage
    const cachedLocation = locationService.getCachedLocation();

    if (cachedLocation) {
      // We have location data, use it and don't show prompt
      setLocation(cachedLocation);
      setHasAskedPermission(true);
      setShowPrompt(false);
    } else {
      // No location data, check if we should show prompt
      const askedBefore = localStorage.getItem('locationPromptShown');

      if (!askedBefore) {
        // First visit, show prompt after a delay
        setTimeout(() => {
          setShowPrompt(true);
        }, 1000); // Delay to avoid overwhelming user immediately
      } else {
        // User has been asked before but declined
        setHasAskedPermission(true);
        setShowPrompt(false);
      }
    }
  }, []);

  const requestLocation = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const locationData = await locationService.getUserLocationData();
      if (locationData) {
        setLocation(locationData);
        setShowPrompt(false);
        setHasAskedPermission(true);
        localStorage.setItem('locationPromptShown', 'true');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const skipLocation = (): void => {
    setShowPrompt(false);
    setHasAskedPermission(true);
    localStorage.setItem('locationPromptShown', 'true');
    // Don't store location data when skipping
  };

  const clearLocation = (): void => {
    setLocation(null);
    locationService.clearCachedLocation();
    localStorage.removeItem('locationPromptShown');
    setHasAskedPermission(false);
  };

  return {
    location,
    isLoading,
    error,
    showPrompt,
    hasAskedPermission,
    requestLocation,
    skipLocation,
    clearLocation
  };
};