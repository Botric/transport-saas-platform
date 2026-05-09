import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tango.passenger',
  appName: 'Tango',
  webDir: 'dist',
  server: {
    // Using https scheme prevents mixed-content blocks and aligns with modern
    // Android WebView security policy.
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,    // needed if backend is HTTP during testing
    backgroundColor: '#2563eb', // Tango blue – matches splash / theme-color
  },
};

export default config;
