import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import HomeScreen from './screens/HomeScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoadingScreen from './components/LoadingScreen';

// Import theme
import { getTheme } from './src/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const currentTheme = getTheme(darkMode);
  
  // Tema de navegação customizado
  const navigationTheme = darkMode ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: currentTheme.colors.primary,
      background: currentTheme.colors.background,
      card: currentTheme.colors.surface,
      text: currentTheme.colors.text,
      border: currentTheme.colors.surface,
    },
  } : {
    ...NavigationDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      primary: currentTheme.colors.primary,
    },
  };

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  };

  // Listener para mudanças de tema
  useEffect(() => {
    const checkThemeChanges = setInterval(async () => {
      try {
        const currentDarkMode = await AsyncStorage.getItem('darkMode');
        const isDark = currentDarkMode ? JSON.parse(currentDarkMode) : false;
        if (isDark !== darkMode) {
          setDarkMode(isDark);
        }
      } catch (error) {
        // Ignora erro silenciosamente
      }
    }, 1000);

    return () => clearInterval(checkThemeChanges);
  }, [darkMode]);

  // Show loading screen first
  if (isLoading) {
    return <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />;
  }

  return (
    <PaperProvider theme={currentTheme}>
      <NavigationContainer theme={navigationTheme}>
        <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
          <StatusBar style={darkMode ? "light" : "auto"} backgroundColor={currentTheme.colors.primary} />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Transactions') {
                  iconName = focused ? 'list' : 'list-outline';
                } else if (route.name === 'Reports') {
                  iconName = focused ? 'analytics' : 'analytics-outline';
                } else if (route.name === 'Settings') {
                  iconName = focused ? 'settings' : 'settings-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: currentTheme.colors.primary,
              tabBarInactiveTintColor: darkMode ? '#888888' : 'gray',
              tabBarStyle: {
                backgroundColor: currentTheme.colors.surface,
                borderTopColor: darkMode ? currentTheme.colors.surface : '#E0E0E0',
              },
              headerStyle: {
                backgroundColor: currentTheme.colors.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}
          >
            <Tab.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'Início' }}
            />
            <Tab.Screen 
              name="Transactions" 
              component={TransactionsScreen}
              options={{ title: 'Transações' }}
            />
            <Tab.Screen 
              name="Reports" 
              component={ReportsScreen}
              options={{ title: 'Relatórios' }}
            />
            <Tab.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Configurações' }}
            />
          </Tab.Navigator>
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});