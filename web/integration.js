/**
 * React Native Web Integration for Payment Management
 * Professional CSS Grid Layout Integration
 * 
 * This file provides integration between React Native components and the CSS Grid layout
 * for a seamless web experience that maintains the mobile app functionality.
 */

// CSS Grid Layout Utils
export const GridLayoutUtils = {
  
  /**
   * Apply CSS Grid classes to React Native Web components
   * @param {string} component - The component type (header, sidebar, main, aside)
   * @returns {object} - Styles object for React Native Web
   */
  getGridStyles: (component) => {
    const baseStyles = {
      header: {
        gridArea: 'header',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto',
        alignItems: 'center',
        padding: '0 2rem',
        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        zIndex: 1000,
      },
      
      sidebar: {
        gridArea: 'sidebar',
        background: '#FFFFFF',
        borderRight: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '2rem 0',
        overflowY: 'auto',
      },
      
      main: {
        gridArea: 'main',
        padding: '2rem',
        overflowY: 'auto',
        background: '#F8F9FA',
      },
      
      aside: {
        gridArea: 'aside',
        background: '#FFFFFF',
        borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '2rem',
      }
    };
    
    return baseStyles[component] || {};
  },
  
  /**
   * Generate responsive dashboard grid styles
   * @param {string} breakpoint - The breakpoint (mobile, tablet, desktop)
   * @returns {object} - Dashboard grid styles
   */
  getDashboardGridStyles: (breakpoint = 'desktop') => {
    const grids = {
      desktop: {
        display: 'grid',
        gridTemplateAreas: `
          "balance balance analytics"
          "chart chart recent"
          "quick quick quick"
        `,
        gridTemplateColumns: '1fr 1fr 300px',
        gap: '2rem',
      },
      
      tablet: {
        display: 'grid',
        gridTemplateAreas: `
          "balance balance"
          "analytics analytics"
          "chart chart"
          "recent recent"
          "quick quick"
        `,
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
      },
      
      mobile: {
        display: 'grid',
        gridTemplateAreas: `
          "balance"
          "analytics"
          "chart"
          "recent"
          "quick"
        `,
        gridTemplateColumns: '1fr',
        gap: '1.5rem',
      }
    };
    
    return grids[breakpoint];
  },
  
  /**
   * Get card component styles with hover effects
   * @param {string} cardType - The type of card (balance, analytics, chart, etc.)
   * @returns {object} - Card styles
   */
  getCardStyles: (cardType) => {
    const baseCard = {
      background: '#FFFFFF',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '2rem',
      transition: 'all 0.3s ease',
    };
    
    const cardStyles = {
      balance: {
        ...baseCard,
        gridArea: 'balance',
        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      },
      
      analytics: {
        ...baseCard,
        gridArea: 'analytics',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
      },
      
      chart: {
        ...baseCard,
        gridArea: 'chart',
        minHeight: 400,
      },
      
      recent: {
        ...baseCard,
        gridArea: 'recent',
      },
      
      quick: {
        ...baseCard,
        gridArea: 'quick',
      }
    };
    
    return cardStyles[cardType] || baseCard;
  }
};

// Theme Management
export const ThemeManager = {
  
  /**
   * CSS custom properties for theming
   */
  cssVariables: {
    light: {
      '--primary-green': '#2E7D32',
      '--primary-light': '#4CAF50',
      '--accent-green': '#81C784',
      '--surface-light': '#FFFFFF',
      '--background-light': '#F8F9FA',
      '--text-primary': '#212121',
      '--text-secondary': '#666666',
      '--error': '#D32F2F',
      '--success': '#388E3C',
      '--warning': '#F57C00',
    },
    
    dark: {
      '--primary-green': '#4CAF50',
      '--primary-light': '#81C784',
      '--accent-green': '#A5D6A7',
      '--surface-light': '#1C1C1C',
      '--background-light': '#0F0F0F',
      '--text-primary': '#FFFFFF',
      '--text-secondary': '#B0B0B0',
      '--error': '#F44336',
      '--success': '#4CAF50',
      '--warning': '#FF9800',
    }
  },
  
  /**
   * Apply theme to React Native Web
   * @param {string} theme - The theme name (light or dark)
   * @param {object} StyleSheet - React Native StyleSheet
   * @returns {object} - Theme styles
   */
  applyTheme: (theme, StyleSheet) => {
    const colors = theme === 'dark' ? {
      primary: '#4CAF50',
      primaryLight: '#81C784',
      surface: '#1C1C1C',
      background: '#0F0F0F',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
    } : {
      primary: '#2E7D32',
      primaryLight: '#4CAF50',
      surface: '#FFFFFF',
      background: '#F8F9FA',
      text: '#212121',
      textSecondary: '#666666',
    };
    
    return StyleSheet.create({
      container: {
        backgroundColor: colors.background,
      },
      surface: {
        backgroundColor: colors.surface,
      },
      text: {
        color: colors.text,
      },
      textSecondary: {
        color: colors.textSecondary,
      },
      primary: {
        color: colors.primary,
      }
    });
  },
  
  /**
   * Toggle theme and persist to storage
   * @param {string} currentTheme - Current theme
   * @param {function} setTheme - Theme setter function
   */
  toggleTheme: async (currentTheme, setTheme) => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
    
    // Update CSS custom properties if running on web
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const variables = ThemeManager.cssVariables[newTheme];
      
      Object.entries(variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }
};

// Responsive Design Utilities
export const ResponsiveUtils = {
  
  /**
   * Get breakpoint-based styles
   * @param {object} dimensions - Window dimensions
   * @returns {string} - Breakpoint name
   */
  getBreakpoint: (dimensions) => {
    const { width } = dimensions;
    
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  },
  
  /**
   * Generate responsive styles for React Native Web
   * @param {object} styles - Style definitions per breakpoint
   * @param {string} breakpoint - Current breakpoint
   * @returns {object} - Responsive styles
   */
  getResponsiveStyles: (styles, breakpoint) => {
    return {
      ...styles.base,
      ...styles[breakpoint]
    };
  },
  
  /**
   * Media query utilities for web
   */
  mediaQueries: {
    mobile: '@media (max-width: 767px)',
    tablet: '@media (min-width: 768px) and (max-width: 1023px)',
    desktop: '@media (min-width: 1024px)',
  }
};

// Animation and Interaction Utils
export const AnimationUtils = {
  
  /**
   * Hover effect styles for interactive elements
   * @param {boolean} isHovered - Hover state
   * @returns {object} - Hover styles
   */
  getHoverStyles: (isHovered) => ({
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: isHovered 
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s ease',
  }),
  
  /**
   * Scale animation for buttons and interactive elements
   * @param {boolean} isPressed - Press state
   * @returns {object} - Scale styles
   */
  getScaleStyles: (isPressed) => ({
    transform: isPressed ? 'scale(0.95)' : 'scale(1)',
    transition: 'transform 0.1s ease',
  }),
  
  /**
   * Slide in animation for cards
   * @param {number} delay - Animation delay in ms
   * @returns {object} - Animation styles
   */
  getSlideInStyles: (delay = 0) => ({
    animation: `slideUp 0.6s ease-out ${delay}ms`,
  })
};

// Integration Hooks for React Native Components
export const IntegrationHooks = {
  
  /**
   * Hook to apply CSS Grid styles to React Native Web components
   * @param {string} component - Component type
   * @param {object} StyleSheet - React Native StyleSheet
   */
  useGridLayout: (component, StyleSheet) => {
    const gridStyles = GridLayoutUtils.getGridStyles(component);
    
    return StyleSheet.create({
      container: gridStyles
    });
  },
  
  /**
   * Hook to manage responsive behavior
   * @param {object} Dimensions - React Native Dimensions
   */
  useResponsive: (Dimensions) => {
    const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));
    
    React.useEffect(() => {
      const subscription = Dimensions.addEventListener('change', setDimensions);
      return () => subscription?.remove();
    }, []);
    
    const breakpoint = ResponsiveUtils.getBreakpoint(dimensions);
    
    return { dimensions, breakpoint };
  },
  
  /**
   * Hook to apply theme styles
   * @param {object} StyleSheet - React Native StyleSheet
   */
  useTheme: (StyleSheet) => {
    const [theme, setTheme] = React.useState('light');
    
    React.useEffect(() => {
      // Load saved theme
      AsyncStorage.getItem('theme').then(savedTheme => {
        if (savedTheme) setTheme(savedTheme);
      });
    }, []);
    
    const themeStyles = ThemeManager.applyTheme(theme, StyleSheet);
    const toggleTheme = () => ThemeManager.toggleTheme(theme, setTheme);
    
    return { theme, themeStyles, toggleTheme };
  }
};

// Export default configuration
export default {
  GridLayoutUtils,
  ThemeManager,
  ResponsiveUtils,
  AnimationUtils,
  IntegrationHooks
};