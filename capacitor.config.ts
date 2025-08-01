import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myymotto.vehiclemanager',
  appName: 'MyyMotto',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#F97316',
      sound: 'beep.wav'
    },
    Device: {
      // Required for device information
    },
    Filesystem: {
      // Required for document storage
    }
  },
  android: {
    allowMixedContent: true
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;