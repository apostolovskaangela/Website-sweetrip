import { Platform } from 'react-native';

// API Configuration
// IMPORTANT: For React Native, you MUST use your machine's IP address, not localhost!
// 
// To find your IP address:
// - Windows: Run `ipconfig` in CMD and look for IPv4 Address (usually 192.168.x.x)
// - Mac/Linux: Run `ifconfig` or `ip addr` and look for inet address
// 
// Platform-specific defaults:
// - Android Emulator: 'http://10.0.2.2:8000/api'
// - iOS Simulator: 'http://localhost:8000/api' (works on iOS simulator)
// - Physical Device: 'http://YOUR_IP_ADDRESS:8000/api' (e.g., 'http://192.168.1.103:8000/api')
//
// Set your backend URL here:
const DEV_BASE_URL = Platform.select({
  android: 'http://192.168.1.103:8000/api', // Android emulator
  ios: 'http://192.168.1.103:8000/api', // iOS simulator
  default: 'http://192.168.1.103:8000/api', // Web/fallback
});

// TODO: Replace with your actual backend IP address for physical devices
// Example: 'http://192.168.1.103:8000/api'
// Uncomment and set this if testing on a physical device:
// const DEV_BASE_URL = 'http://192.168.1.103:8000/api';

export const API_CONFIG = {
  BASE_URL: __DEV__
    ? DEV_BASE_URL || 'http://localhost:8000/api'
    : 'https://your-domain.com/api', // Production URL
};


