import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen({ onLoadingComplete }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação de rotação contínua para o ícone
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Simular carregamento por 3 segundos
    const timer = setTimeout(() => {
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      rotateAnimation.stop();
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {/* Logo/Ícone Principal */}
        <Animated.View 
          style={[
            styles.iconContainer,
            { transform: [{ rotate }] }
          ]}
        >
          <View style={styles.iconInner}>
            <Ionicons name="wallet" size={75} color="#FFFFFF" />
          </View>
        </Animated.View>

        {/* Nome do App */}
        <View style={styles.titleContainer}>
          <Text style={styles.appName}>Payment Manager</Text>
          <View style={styles.underline} />
          <Text style={styles.tagline}>Gestão Financeira Profissional</Text>
        </View>

        {/* Indicador de Carregamento */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View 
              style={[
                styles.loadingProgress,
                {
                  transform: [{ scaleX: scaleAnim }],
                }
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>

        {/* Informações da Versão */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>v1.0.0 • Solução Empresarial</Text>
          <Text style={styles.copyrightText}>Desenvolvido o app teste por Thiago</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32', // Verde corporativo alinhado ao tema do sistema
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 40,
    minHeight: '100vh', // Garante altura mínima na web
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  iconInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  underline: {
    width: 80,
    height: 3,
    backgroundColor: '#A5D6A7',
    marginVertical: 12,
    borderRadius: 2,
    shadowColor: '#A5D6A7',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  appName: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  tagline: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 30,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#A5D6A7',
    borderRadius: 2,
    width: '100%',
    shadowColor: '#A5D6A7',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  versionContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  copyrightText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '300',
    letterSpacing: 0.3,
  },
});