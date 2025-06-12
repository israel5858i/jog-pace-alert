
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
      console.log('Starting GPS tracking...');
      
      // Clear any existing error
      setError(null);
      
      // Request permissions first
      console.log('Requesting location permissions...');
      const permissions = await Geolocation.requestPermissions();
      console.log('Permissions result:', permissions);
      
      if (permissions.location !== 'granted') {
        setError('Location permission denied. Please enable location access in your device settings.');
        return;
      }

      // Get current position first to test if GPS is working
      console.log('Getting current position...');
      const currentPosition = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
      
      console.log('Current position:', currentPosition);
      
      // Start watching position
      console.log('Starting position watch...');
      watchId.current = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        },
        (position, err) => {
          console.log('Position update:', position, 'Error:', err);
          
          if (err) {
            console.error('Position watch error:', err);
            setError(`GPS error: ${err.message}`);
            return;
          }
          
          if (position) {
            // Convert speed from m/s to km/h
            const speedKmh = position.coords.speed ? (position.coords.speed * 3.6) : 0;
            
            console.log('Speed update:', speedKmh, 'km/h');
            
            setGPSData({
              speed: Math.max(0, speedKmh), // Ensure non-negative speed
              accuracy: position.coords.accuracy || 0,
              isTracking: true
            });
            setError(null);
          }
        }
      );
      
      console.log('Watch ID:', watchId.current);
      
    } catch (err) {
      console.error('GPS Error:', err);
      setError(`Failed to start GPS tracking: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const stopTracking = async () => {
    console.log('Stopping GPS tracking...');
    if (watchId.current) {
      try {
        await Geolocation.clearWatch({ id: watchId.current });
        watchId.current = null;
        console.log('GPS tracking stopped');
      } catch (err) {
        console.error('Error stopping GPS tracking:', err);
      }
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
