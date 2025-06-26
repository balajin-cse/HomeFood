import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B35',
    secondary: '#F7931E',
    accent: '#FFB74D',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
  },
};