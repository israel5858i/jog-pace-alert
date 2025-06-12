
import React, { useState, useEffect } from 'react';
import { useGPS } from '../hooks/useGPS';
import { useAudioAlert } from '../hooks/useAudioAlert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Play, Pause, Settings } from 'lucide-react';

const Speedometer = () => {
  const { gpsData, error, startTracking, stopTracking } = useGPS();
  const { playBeep } = useAudioAlert();
  const [targetSpeed, setTargetSpeed] = useState(10); // Default 10 km/h
  const [showSettings, setShowSettings] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState(0);

  // Alert when speed drops below target (with 3 second cooldown)
  useEffect(() => {
    const now = Date.now();
    if (
      gpsData.isTracking && 
      gpsData.speed < targetSpeed && 
      gpsData.speed > 0 && // Only alert when actually moving
      now - lastAlertTime > 3000 // 3 second cooldown
    ) {
      playBeep();
      setLastAlertTime(now);
    }
  }, [gpsData.speed, targetSpeed, gpsData.isTracking, playBeep, lastAlertTime]);

  const getSpeedColor = () => {
    if (!gpsData.isTracking) return 'text-gray-400';
    if (gpsData.speed >= targetSpeed) return 'text-green-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (!gpsData.isTracking) return 'Not tracking';
    if (gpsData.speed >= targetSpeed) return 'On pace! 🎯';
    if (gpsData.speed > 0) return 'Below target 🔔';
    return 'Standing still';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8">
          <h1 className="text-2xl font-bold text-gray-800">GPS Speedometer</h1>
          <p className="text-gray-600">Running Pace Tracker</p>
        </div>

        {/* Main Speed Display */}
        <Card className="p-8 text-center bg-white shadow-xl">
          <div className="space-y-4">
            <div className={`text-6xl font-bold ${getSpeedColor()}`}>
              {gpsData.speed.toFixed(1)}
            </div>
            <div className="text-xl text-gray-600">km/h</div>
            <div className="text-sm font-medium text-gray-700">
              {getStatusText()}
            </div>
            {gpsData.accuracy > 0 && (
              <div className="text-xs text-gray-500">
                Accuracy: ±{gpsData.accuracy.toFixed(0)}m
              </div>
            )}
          </div>
        </Card>

        {/* Target Speed Setting */}
        <Card className="p-4 bg-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800">Target Speed</div>
              <div className="text-sm text-gray-600">{targetSpeed} km/h</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          {showSettings && (
            <div className="mt-4 space-y-3">
              <Input
                type="number"
                value={targetSpeed}
                onChange={(e) => setTargetSpeed(Number(e.target.value))}
                min="1"
                max="50"
                className="text-center"
              />
              <div className="text-xs text-gray-500 text-center">
                Set your desired running pace (1-50 km/h)
              </div>
            </div>
          )}
        </Card>

        {/* Control Buttons */}
        <div className="space-y-3">
          <Button
            onClick={gpsData.isTracking ? stopTracking : startTracking}
            className={`w-full py-6 text-lg ${
              gpsData.isTracking 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {gpsData.isTracking ? (
              <>
                <Pause className="w-6 h-6 mr-2" />
                Stop Tracking
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-2" />
                Start Tracking
              </>
            )}
          </Button>
          
          {error && (
            <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="text-sm text-blue-800 space-y-2">
            <div className="font-semibold">How it works:</div>
            <ul className="space-y-1 text-xs">
              <li>• Start tracking to monitor your running speed</li>
              <li>• Set your target pace in the settings</li>
              <li>• Get audio + vibration alerts when below target</li>
              <li>• Works with screen off (keep app open)</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Speedometer;
