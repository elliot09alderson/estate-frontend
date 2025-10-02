import React, { useState } from 'react';
import { MapPin, Loader2, X, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import locationService, { LocationData } from '@/services/locationService';

interface LocationPromptProps {
  onLocationDetected: (location: LocationData) => void;
  onSkip: () => void;
  showPrompt: boolean;
}

const LocationPrompt: React.FC<LocationPromptProps> = ({
  onLocationDetected,
  onSkip,
  showPrompt
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const locationData = await locationService.getUserLocationData();

      if (locationData) {
        toast({
          title: 'Location detected!',
          description: `Found properties near ${locationService.formatLocation(locationData)}`
        });
        onLocationDetected(locationData);
      } else {
        setError('Unable to detect your location. Please try again or skip.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to get your location');
      toast({
        title: 'Location Error',
        description: error.message || 'Failed to get your location',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Navigation className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Find Properties Near You</CardTitle>
              <p className="text-muted-foreground text-sm">
                We'll show you properties in your area based on your location
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleGetLocation}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting your location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Use My Location
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Skip for Now
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                <p>We'll only use your location to show nearby properties.</p>
                <p>Your location data is stored locally on your device.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LocationPrompt;