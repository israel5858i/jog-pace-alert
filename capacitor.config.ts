
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9ce6f628319a4d628cd6da99ccdbe68a',
  appName: 'GPS Speedometer',
  webDir: 'dist',
  server: {
    url: 'https://9ce6f628-319a-4d62-8cd6-da99ccdbe68a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      permissions: {
        location: "always"
      }
    }
  }
};

export default config;
