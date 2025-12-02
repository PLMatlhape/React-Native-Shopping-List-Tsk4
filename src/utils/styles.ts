// Cross-platform style utilities
import { Platform, ViewStyle } from 'react-native';

interface ShadowOptions {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  opacity?: number;
  radius?: number;
  elevation?: number;
}

/**
 * Creates cross-platform shadow styles
 * Uses native shadow props for iOS/Android and boxShadow for web
 */
export const createShadow = ({
  color = '#000',
  offsetX = 0,
  offsetY = 2,
  opacity = 0.1,
  radius = 4,
  elevation = 3,
}: ShadowOptions = {}): ViewStyle => {
  if (Platform.OS === 'web') {
    // Use boxShadow for web to avoid deprecation warnings
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    } as ViewStyle;
  }

  // Use native shadow props for iOS and Android
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation, // Android
  };
};

// Pre-defined shadow styles
export const shadows = {
  small: createShadow({ offsetY: 1, radius: 2, opacity: 0.05, elevation: 1 }),
  medium: createShadow({ offsetY: 2, radius: 4, opacity: 0.1, elevation: 3 }),
  large: createShadow({ offsetY: 4, radius: 8, opacity: 0.15, elevation: 5 }),
};

// Colors used throughout the app
export const THEME_COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  border: '#E0E0E0',
  error: '#F44336',
  warning: '#FF9800',
  success: '#4CAF50',
};
