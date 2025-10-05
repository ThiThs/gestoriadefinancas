import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E7D32',      // Verde para finanças
    accent: '#4CAF50',        // Verde mais claro
    background: '#F5F5F5',    // Fundo claro
    surface: '#FFFFFF',       // Superfície dos cards
    error: '#D32F2F',         // Vermelho para erros/débitos
    success: '#388E3C',       // Verde para créditos
    warning: '#F57C00',       // Laranja para avisos
    text: '#212121',          // Texto escuro
    placeholder: '#9E9E9E',   // Placeholder dos inputs
  },
  roundness: 8,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'Roboto',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Roboto',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'Roboto',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'Roboto',
      fontWeight: '100',
    },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    color: theme.colors.text,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    color: theme.colors.placeholder,
  },
};