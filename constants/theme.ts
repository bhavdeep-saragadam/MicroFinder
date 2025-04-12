import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { configureFonts } from 'react-native-paper';
import type { MD3TypescaleKey } from 'react-native-paper/lib/typescript/types';

const baseFont = {
  fontFamily: 'System',
  letterSpacing: 0,
  fontWeight: '400',
  lineHeight: 20,
  fontSize: 14,
} as const;

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    error: '#FF3B30',
    text: '#000000',
    onSurface: '#000000',
    disabled: '#999999',
    placeholder: '#999999',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF3B30',
  },
  fonts: configureFonts({ config: { default: baseFont }, isV3: true }),
};

// Define our custom colors
const colors = {
  primary: '#2196F3', // Blue
  secondary: '#00BCD4', // Cyan
  tertiary: '#673AB7', // Deep Purple
  error: '#B00020', // Standard error color
  background: '#F5F5F5',
  surface: '#FFFFFF',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onTertiary: '#FFFFFF',
  onBackground: '#000000',
  onSurface: '#000000',
  onError: '#FFFFFF',
};

// Create our light theme
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
};

// Create our dark theme
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...colors,
    background: '#121212',
    surface: '#1E1E1E',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
  },
};

// Export the theme (default to light theme)
export default lightTheme;