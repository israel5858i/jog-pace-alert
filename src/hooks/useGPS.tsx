
import { useState, useEffect, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

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
  const [isWebMode, setIsWebMode] = useState(false);
  const watchId = useRef<string | number | null>(null);

  useEffect(() => {
    // Detect if we're running on web or native
    const platform = Capacitor.getPlatform();
    setIsWebMode(platform === 'web');
    console.log('Platform detected:', platform);
  }, []);

  const startWebTracking = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    console.log('Starting web GPS tracking...');
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    const watchId_web = navigator.geolocation.watchPosition(
      (position) => {
        console.log('Web position update:', position);
        
        // Convert speed from m/s to km/h (web API might not always provide speed)
        const speedKmh = position.coords.speed ? (position.coords.speed * 3.6) : 0;
        
        console.log('Web speed update:', speedKmh, 'km/h');
        
        setGPSData({
          speed: Math.max(0, speedKmh),
          accuracy: position.coords.accuracy || 0,
          isTracking: true
        });
        setError(null);
      },
      (err) => {
        console.error('Web geolocation error:', err);
        setError(`GPS error: ${err.message}`);
      },
      options
    );

    watchId.current = watchId_web;
  };

  const startNativeTracking = async () => {
    try {
      console.log('Starting native GPS tracking...');
      
      setError(null);
      
      console.log('Requesting location permissions...');
      const permissions = await Geolocation.requestPermissions();
      console.log('Permissions result:', permissions);
      
      if (permissions.location !== 'granted') {
        setError('Location permission denied. Please enable location access in your device settings.');
        return;
      }

      console.log('Getting current position...');
      const currentPosition = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
      
      console.log('Current position:', currentPosition);
      
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
            const speedKmh = position.coords.speed ? (position.coords.speed * 3.6) : 0;
            
            console.log('Speed update:', speedKmh, 'km/h');
            
            setGPSData({
              speed: Math.max(0, speedKmh),
              accuracy: position.coords.accuracy || 0,
              isTracking: true
            });
            setError(null);
          }
        }
      );
      
      console.log('Watch ID:', watchId.current);
      
    } catch (err) {
      console.error('Native GPS Error:', err);
      setError(`Failed to start GPS tracking: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const startTracking = async () => {
    if (isWebMode) {
      await startWebTracking();
    } else {
      await startNativeTracking();
    }
  };

  const stopTracking = async () => {
    console.log('Stopping GPS tracking...');
    if (watchId.current) {
      try {
        if (isWebMode) {
          navigator.geolocation.clearWatch(watchId.current as number);
          console.log('Web GPS tracking stopped');
        } else {
          await Geolocation.clearWatch({ id: watchId.current as string });
          console.log('Native GPS tracking stopped');
        }
        watchId.current = null;
      } catch (err) {
        console.error('Error stopping GPS tracking:', err);
      }
    }
    setGPSData(prev => ({ ...prev, isTracking: false }));
  };

  useEffect(() => {
    return () => {
      if (watchId.current) {
        if (isWebMode) {
          navigator.geolocation.clearWatch(watchId.current as number);
        } else {
          Geolocation.clearWatch({ id: watchId.current as string });
        }
      }
    };
  }, [isWebMode]);

  return {
    gpsData,
    error,
    startTracking,
    stopTracking,
    isWebMode
  };
};
