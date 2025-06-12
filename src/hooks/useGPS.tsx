
import { useState, useEffect, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export interface GPSData {
  speed: number; // in km/h
  accuracy: number;
  isTracking: boolean;
}

export const useGPS = () => {
  const [gpsData, setGPSData] = useState<GPSData>({
    speed: 0,
    accuracy: 0,
    isTracking: false
  });
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<string | null>(null);

  const startTracking = async () => {
    try {
      // Request permissions
      const permissions = await Geolocation.requestPermissions();
      
      if (permissions.location !== 'granted') {
        setError('Location permission denied');
        return;
      }

      // Start watching position
      watchId.current = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        },
        (position, err) => {
          if (err) {
            setError(err.message);
            return;
          }
          
          if (position) {
            // Convert speed from m/s to km/h
            const speedKmh = position.coords.speed ? (position.coords.speed * 3.6) : 0;
            
            setGPSData({
              speed: Math.max(0, speedKmh), // Ensure non-negative speed
              accuracy: position.coords.accuracy || 0,
              isTracking: true
            });
            setError(null);
          }
        }
      );
    } catch (err) {
      setError('Failed to start GPS tracking');
      console.error('GPS Error:', err);
    }
  };

  const stopTracking = async () => {
    if (watchId.current) {
      await Geolocation.clearWatch({ id: watchId.current });
      watchId.current = null;
    }
    setGPSData(prev => ({ ...prev, isTracking: false }));
  };

  useEffect(() => {
    return () => {
      if (watchId.current) {
        Geolocation.clearWatch({ id: watchId.current });
      }
    };
  }, []);

  return {
    gpsData,
    error,
    startTracking,
    stopTracking
  };
};
