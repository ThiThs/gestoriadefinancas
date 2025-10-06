import React from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Enhanced Card Component with gradient backgrounds and animations
 * Professional look for financial applications
 */
export const EnhancedCard = ({ 
  children, 
  style, 
  elevation = 6,
  gradient = null,
  animated = false,
  onPress = null,
  padding = 16,
  ...props 
}) => {
  const theme = useTheme();
  const animatedValue = new Animated.Value(1);

  const handlePressIn = () => {
    if (animated && onPress) {
      Animated.spring(animatedValue, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const CardContent = () => (
    <View style={[styles.cardContent, { padding }]}>
      {children}
    </View>
  );

  if (gradient) {
    return (
      <Animated.View
        style={[
          styles.cardContainer,
          style,
          animated && {
            transform: [{ scale: animatedValue }]
          }
        ]}
        {...(onPress && {
          onTouchStart: handlePressIn,
          onTouchEnd: handlePressOut,
        })}
        {...props}
      >
        <Surface style={[styles.surface, { elevation }]}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <CardContent />
          </LinearGradient>
        </Surface>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        style,
        animated && {
          transform: [{ scale: animatedValue }]
        }
      ]}
      {...(onPress && {
        onTouchStart: handlePressIn,
        onTouchEnd: handlePressOut,
      })}
      {...props}
    >
      <Surface 
        style={[
          styles.surface, 
          { 
            elevation,
            backgroundColor: theme.colors.surface,
          }
        ]}
      >
        <CardContent />
      </Surface>
    </Animated.View>
  );
};

/**
 * Balance Card with gradient and animated numbers
 */
export const BalanceCard = ({ 
  balance, 
  title = "Saldo Disponível",
  subtitle = null,
  icon = null,
  style,
  ...props 
}) => {
  const theme = useTheme();
  
  const getGradient = () => {
    if (balance > 0) return ['#2E7D32', '#4CAF50', '#81C784'];
    if (balance < 0) return ['#D32F2F', '#F44336', '#E57373'];
    return ['#455A64', '#607D8B', '#90A4AE'];
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <EnhancedCard
      gradient={getGradient()}
      style={[styles.balanceCard, style]}
      animated={true}
      {...props}
    >
      <View style={styles.balanceHeader}>
        {icon && (
          <View style={styles.balanceIcon}>
            {icon}
          </View>
        )}
        <Text style={styles.balanceTitle}>{title}</Text>
      </View>
      
      <Text style={styles.balanceAmount}>
        {formatCurrency(balance)}
      </Text>
      
      {subtitle && (
        <Text style={styles.balanceSubtitle}>
          {subtitle}
        </Text>
      )}
      
      <View style={styles.balanceIndicator}>
        <View style={[
          styles.indicatorDot, 
          { backgroundColor: balance >= 0 ? '#81C784' : '#E57373' }
        ]} />
        <Text style={styles.indicatorText}>
          {balance >= 0 ? 'Positivo' : 'Negativo'}
        </Text>
      </View>
    </EnhancedCard>
  );
};

/**
 * Metric Card for displaying key performance indicators
 */
export const MetricCard = ({ 
  value, 
  label, 
  icon = null, 
  trend = null,
  color = null,
  style,
  ...props 
}) => {
  const theme = useTheme();
  
  const getTrendColor = () => {
    if (trend > 0) return '#4CAF50';
    if (trend < 0) return '#F44336';
    return theme.colors.text;
  };

  const getTrendIcon = () => {
    if (trend > 0) return '↗';
    if (trend < 0) return '↘';
    return '→';
  };

  return (
    <EnhancedCard
      style={[styles.metricCard, style]}
      elevation={4}
      padding={12}
      animated={true}
      {...props}
    >
      <View style={styles.metricHeader}>
        {icon && (
          <View style={[styles.metricIcon, color && { backgroundColor: color + '20' }]}>
            {icon}
          </View>
        )}
        {trend !== null && (
          <Text style={[styles.trendIndicator, { color: getTrendColor() }]}>
            {getTrendIcon()}
          </Text>
        )}
      </View>
      
      <Text style={[styles.metricValue, color && { color }]}>
        {value}
      </Text>
      
      <Text style={styles.metricLabel}>
        {label}
      </Text>
      
      {trend !== null && (
        <Text style={[styles.trendText, { color: getTrendColor() }]}>
          {Math.abs(trend).toFixed(1)}% {trend >= 0 ? 'aumento' : 'queda'}
        </Text>
      )}
    </EnhancedCard>
  );
};

/**
 * Category Progress Card with animated progress bars
 */
export const CategoryProgressCard = ({ 
  categories = [], 
  total = 0,
  title = "Gastos por Categoria",
  style,
  ...props 
}) => {
  const theme = useTheme();
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
  ];

  return (
    <EnhancedCard
      style={[styles.progressCard, style]}
      {...props}
    >
      <Text style={styles.progressTitle}>{title}</Text>
      
      {categories.map((category, index) => {
        const percentage = total > 0 ? (category.value / total) * 100 : 0;
        const color = colors[index % colors.length];
        
        return (
          <View key={category.name} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryDot, { backgroundColor: color }]} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <Text style={styles.categoryAmount}>
                R$ {category.value.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${percentage}%`,
                    backgroundColor: color 
                  }
                ]} 
              />
            </View>
            
            <Text style={styles.percentageText}>
              {percentage.toFixed(1)}%
            </Text>
          </View>
        );
      })}
      
      {categories.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Nenhum gasto por categoria ainda
          </Text>
        </View>
      )}
    </EnhancedCard>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 8,
    marginHorizontal: 4,
  },
  surface: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gradient: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
  },
  
  // Balance Card Styles
  balanceCard: {
    marginVertical: 12,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceIcon: {
    marginRight: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginVertical: 8,
    letterSpacing: -1,
  },
  balanceSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  balanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  indicatorText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Metric Card Styles
  metricCard: {
    flex: 1,
    margin: 4,
    minHeight: 100,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    padding: 6,
    borderRadius: 6,
  },
  trendIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Progress Card Styles
  progressCard: {
    marginVertical: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    minWidth: 2,
  },
  percentageText: {
    fontSize: 11,
    textAlign: 'right',
    opacity: 0.7,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
});

export default EnhancedCard;