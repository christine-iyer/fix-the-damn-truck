// client/app/index.tsx (root entry)
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, withDelay, withRepeat, interpolateColor, SharedValue } from 'react-native-reanimated';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  // Hover states for web hover effects
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  
  // Helper function to get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin/home';
      case 'mechanic':
        return '/mechanic/home';
      case 'customer':
        return '/customer/home';
      default:
        return '/';
    }
  };

  const handleDashboardPress = () => {
    const route = getDashboardRoute();
    handleButtonPress(button1Scale, route);
  };
  
  // Animation values using Reanimated
  const fadeAnim = useSharedValue(0);
  const slideYAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.9);
  const button1Scale = useSharedValue(1);
  const button2Scale = useSharedValue(1);
  const button1Opacity = useSharedValue(1);
  const button2Glow = useSharedValue(0);
  
  useEffect(() => {
    // Entrance animations
    fadeAnim.value = withDelay(200, withTiming(1, { duration: 800 }));
    slideYAnim.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
    scaleAnim.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 90 }));
    
    // Subtle secondary button border animation
    button2Glow.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, [fadeAnim, slideYAnim, scaleAnim, button2Glow]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: slideYAnim.value },
      { scale: scaleAnim.value }
    ],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideYAnim.value * 0.7 }],
  }));

  const button2Style = useAnimatedStyle(() => ({
    transform: [{ scale: button2Scale.value }],
  }));

  // Primary button hover/press animation
  const primaryButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: button1Opacity.value,
      transform: [{ scale: button1Scale.value }],
    };
  });

  // Secondary button glow animation
  const secondaryButtonGlowStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      button2Glow.value,
      [0, 0.5, 1],
      ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.5)']
    );
    
    return {
      borderColor,
    };
  });


  const handleButtonPress = (scale: SharedValue<number>, route: any) => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    setTimeout(() => router.push(route as any), 150);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Image 
          source={require('../assets/images/auto_index_img_1.png')} 
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
        <View style={styles.overlay} />
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Show welcome screen for all users - no auto-navigation

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Image 
        source={require('../assets/images/auto_index_img_1.png')} 
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      
      {/* Gradient overlay layers for depth */}
      <View style={styles.overlay} />
      <View style={styles.overlayGradient} />
      
      {/* Glassmorphism blur effect */}
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
      
      {/* Decorative circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <View style={styles.contentContainer}>
        {/* Logo/Icon Area */}
        <Animated.View style={[styles.iconContainer, titleStyle]}>
          <View style={styles.iconCircle}>
            <Ionicons name="car-sport" size={48} color="#FFFFFF" />
          </View>
        </Animated.View>

        {/* Title with animation */}
        <Animated.Text style={[styles.title, titleStyle]}>
          Welcome to AutoApp
        </Animated.Text>
        
        {/* Subtitle with decorative line */}
        <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
          <View style={styles.decorativeLine} />
          <Animated.Text style={styles.subtitle}>
            Your trusted automotive service platform
          </Animated.Text>
          <View style={styles.decorativeLine} />
        </Animated.View>

        {/* Feature highlights */}
        <Animated.View style={[styles.featuresContainer, subtitleStyle]}>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Trusted Mechanics</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="time" size={20} color="#2196F3" />
            <Text style={styles.featureText}>24/7 Service</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="star" size={20} color="#FFC107" />
            <Text style={styles.featureText}>Quality Guaranteed</Text>
          </View>
        </Animated.View>

        {/* Buttons with animations */}
        <View style={styles.buttonContainer}>
          {user ? (
            // Show Dashboard button when logged in
            <TouchableOpacity 
              style={[
                styles.primaryButton,
                hoveredButton === 'dashboard' && styles.primaryButtonHover
              ]}
              onPress={handleDashboardPress}
              onPressIn={() => {
                button1Scale.value = withTiming(0.92, { duration: 150 });
                button1Opacity.value = withTiming(0.7, { duration: 150 });
              }}
              onPressOut={() => {
                button1Scale.value = withSpring(1, { damping: 10, stiffness: 300 });
                button1Opacity.value = withSpring(1, { damping: 10, stiffness: 300 });
              }}
              activeOpacity={1}
              {...(Platform.OS === 'web' ? {
                onMouseEnter: () => setHoveredButton('dashboard'),
                onMouseLeave: () => setHoveredButton(null)
              } : {})}
            >
              <Animated.View style={[styles.primaryButtonContent, primaryButtonAnimatedStyle]}>
                <Ionicons name="home" size={22} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
              </Animated.View>
            </TouchableOpacity>
          ) : (
            // Show Login button when not logged in
            <TouchableOpacity 
              style={[
                styles.primaryButton,
                hoveredButton === 'login' && styles.primaryButtonHover
              ]}
              onPress={() => handleButtonPress(button1Scale, "/auth/login")}
              onPressIn={() => {
                button1Scale.value = withTiming(0.92, { duration: 150 });
                button1Opacity.value = withTiming(0.7, { duration: 150 });
              }}
              onPressOut={() => {
                button1Scale.value = withSpring(1, { damping: 10, stiffness: 300 });
                button1Opacity.value = withSpring(1, { damping: 10, stiffness: 300 });
              }}
              activeOpacity={1}
              {...(Platform.OS === 'web' ? {
                onMouseEnter: () => setHoveredButton('login'),
                onMouseLeave: () => setHoveredButton(null)
              } : {})}
            >
              <Animated.View style={[styles.primaryButtonContent, primaryButtonAnimatedStyle]}>
                <Ionicons name="log-in" size={22} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Login</Text>
              </Animated.View>
            </TouchableOpacity>
          )}
          
          {!user && (
            // Show Sign Up button only when not logged in
            <Animated.View style={button2Style}>
              <TouchableOpacity 
                style={[
                  styles.secondaryButton, 
                  secondaryButtonGlowStyle,
                  hoveredButton === 'signup' && styles.secondaryButtonHover
                ]}
                onPress={() => handleButtonPress(button2Scale, '/auth/signup')}
                onPressIn={() => {
                  button2Scale.value = withTiming(0.94, { duration: 100 });
                }}
                onPressOut={() => {
                  button2Scale.value = withSpring(1, { damping: 10, stiffness: 300 });
                }}
                activeOpacity={1}
                {...(Platform.OS === 'web' ? {
                  onMouseEnter: () => setHoveredButton('signup'),
                  onMouseLeave: () => setHoveredButton(null)
                } : {})}
              >
                <Ionicons name="person-add" size={22} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.secondaryButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 50, 100, 0.15)',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  title: {
    fontSize: 42,  // Reduced from 48
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    letterSpacing: 1.5,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    justifyContent: 'center',
  },
  decorativeLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
  },

  subtitle: {
    fontSize: 16,  // Reduced from 18
    color: '#F0F0F0',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    lineHeight: 24,  // Reduced from 26
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    fontWeight: '500',
  },

  buttonContainer: {
    width: '45%',  // Changed from '100%'
    alignSelf: 'center',  // Add this to center the buttons
    gap: 16,
    marginTop: 20,
  },

  primaryButton: {
    backgroundColor: '#6B8FA3', // Dusty blue
    position: 'relative',
    overflow: 'visible',
    paddingVertical: 16,  // Reduced from 18
    paddingHorizontal: 28,  // Reduced from 32
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#6B8FA3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    width: '100%',  // 100% of buttonContainer width
  },
  primaryButtonHover: {
    backgroundColor: '#7BA8BD',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.7,
    shadowRadius: 16,
  },
  primaryButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,  // Reduced from 18
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },


  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 16,  // Reduced from 18
    paddingHorizontal: 28,  // Reduced from 32
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    backdropFilter: 'blur(10px)',
    width: '100%',  // 100% of buttonContainer width
  },
  secondaryButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,  // Reduced from 18
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 8,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    top: -100,
    right: -100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    bottom: -50,
    left: -50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 193, 7, 0.06)',
    top: '30%',
    left: -30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  successIcon: {
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});