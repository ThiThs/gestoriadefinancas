import { DefaultTheme } from 'react-native-paper';

const lightTheme = {
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
  },
};

const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50',       // Verde principal
    primaryContainer: '#2E7D32',
    accent: '#81C784',        // Verde accent
    background: '#0F0F0F',    // Fundo muito escuro
    surface: '#1C1C1C',       // Superfície escura
    surfaceVariant: '#2A2A2A', // Variação de superfície
    error: '#FF5252',         // Erro vermelho claro
    success: '#4CAF50',       // Verde sucesso
    warning: '#FFC107',       // Amarelo aviso
    text: '#FFFFFF',          // Texto principal branco
    onSurface: '#FFFFFF',     // Texto em superfície
    onSurfaceVariant: '#E0E0E0', // Texto secundário
    onBackground: '#FFFFFF',  // Texto em fundo
    placeholder: '#B0B0B0',   // Placeholder visível
    disabled: '#666666',      // Elementos desabilitados
    backdrop: 'rgba(0,0,0,0.8)', // Fundo de modais
  },
  roundness: 8,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'Roboto',
      fontWeight: 'normal',
    },
  },
};

export const getTheme = (isDark = false) => isDark ? darkTheme : lightTheme;

export const theme = lightTheme; // Manter compatibilidade

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