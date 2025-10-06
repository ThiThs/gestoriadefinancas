import React, { createContext, useContext, useState, useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '../theme';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  theme: null,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDark(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newTheme));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = getTheme(isDark);

  const contextValue = {
    isDark,
    toggleTheme,
    theme,
  };

  if (isLoading) {
    return null; // ou um loading spinner
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};