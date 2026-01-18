// loginScreen 
import { useRouter } from "expo-router";
import React, { useState, useEffect } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, withDelay, withRepeat, interpolateColor, interpolate } from 'react-native-reanimated';

export default function Login() {
  const router = useRouter();
  const { login, user, logout } = useAuth();

  //Track email & password values 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Hover states for web hover effects
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Animation values using Reanimated
  const fadeAnim = useSharedValue(0);
  const slideYAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.9);
  const buttonScale = useSharedValue(1);
  const formOpacity = useSharedValue(0);
  const primaryButtonOpacity = useSharedValue(1);
  const secondaryButtonColor = useSharedValue(0);
  const emailFocusAnim = useSharedValue(0);
  const passwordFocusAnim = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    fadeAnim.value = withDelay(200, withTiming(1, { duration: 800 }));
    slideYAnim.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
    scaleAnim.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 90 }));
    formOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    
    // Only animate secondary button border (subtle)
    secondaryButtonColor.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, [fadeAnim, slideYAnim, scaleAnim, formOpacity, secondaryButtonColor]);

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

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: slideYAnim.value * 0.8 }],
  }));

  // Primary button hover/press animation
  const primaryButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: primaryButtonOpacity.value,
      transform: [{ scale: buttonScale.value }],
    };
  });

  // Secondary button border color animation
  const secondaryButtonAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      secondaryButtonColor.value,
      [0, 0.5, 1],
      ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.5)']
    );
    
    return {
      borderColor,
    };
  });


  // Input focus animations
  useEffect(() => {
    emailFocusAnim.value = withTiming(emailFocused ? 1 : 0, { duration: 200 });
  }, [emailFocused, emailFocusAnim]);

  useEffect(() => {
    passwordFocusAnim.value = withTiming(passwordFocused ? 1 : 0, { duration: 200 });
  }, [passwordFocused, passwordFocusAnim]);

  const emailInputStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(emailFocusAnim.value, [0, 1], [1, 1.02]) }],
    };
  });

  const passwordInputStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(passwordFocusAnim.value, [0, 1], [1, 1.02]) }],
    };
  });

  // Enhanced hover/press effect handlers with pulse
  const handlePrimaryPressIn = () => {
    buttonScale.value = withTiming(0.92, { duration: 150 });
    primaryButtonOpacity.value = withTiming(0.7, { duration: 150 });
  };

  const handlePrimaryPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 10, stiffness: 300 });
    primaryButtonOpacity.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const handleSecondaryPressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 150 });
  };

  const handleSecondaryPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const handleButtonPress = (route: any) => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    setTimeout(() => router.push(route as any), 150);
  };

  // unified alert for web + mobile 
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        showAlert("Success", result.message);
        // Navigation will be handled automatically by AuthContext
      } else {
        showAlert("Error", result.message);
      }
    } catch {
      showAlert("Error", "Network error, try again later");
    } finally {
      setIsLoading(false);
    }
  };

  const validateAndSubmit = () => {
    if (!email || !password) {
      showAlert("Error", "Please fill out all fields");
      return;
    }
    handleLogin();
  };

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

  const handleLogout = async () => {
    try {
      await logout();
      // Clear form fields on logout
      setEmail('');
      setPassword('');
      setIsPasswordVisible(false);
      setEmailFocused(false);
      setPasswordFocused(false);
      // Navigate to home page after logout
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDashboardPress = () => {
    const route = getDashboardRoute();
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/auto_login_img_2.png')} 
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

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.contentContainer, containerStyle]}>
            {/* Logo/Icon Area */}
            <Animated.View style={[styles.iconContainer, titleStyle]}>
              <View style={styles.iconCircle}>
                <Ionicons name="car-sport" size={48} color="#FFFFFF" />
              </View>
            </Animated.View>

            {/* Title with animation */}
            <Animated.Text style={[styles.title, titleStyle]}>
              Welcome Back
            </Animated.Text>
            
            {/* Subtitle with decorative line */}
            <Animated.View style={[styles.subtitleContainer, titleStyle]}>
              <View style={styles.decorativeLine} />
              <Animated.Text style={styles.subtitle}>
                Sign in to continue
              </Animated.Text>
              <View style={styles.decorativeLine} />
            </Animated.View>

            {/* Login Form */}
            <Animated.View style={[styles.formContainer, formStyle]}>
              {/* Email Input - hide when logged in */}
              {!user && (
                <Animated.View style={[styles.inputContainer, emailInputStyle]}>
                  <Ionicons name="mail-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
      <TextInput
        placeholder='Email'
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </Animated.View>
              )}

              {/* Password Input - hide when logged in */}
              {!user && (
                <Animated.View style={[styles.inputContainer, passwordInputStyle]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
      <TextInput
        placeholder='Password'
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    secureTextEntry={!isPasswordVisible}
        style={styles.input}
        value={password}
        onChangeText={setPassword}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    textContentType="password"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity 
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Forgot Password Link - only show when not logged in */}
              {!user && (
                <TouchableOpacity 
                  onPress={() => router.push('/auth/forgot-password')}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              {/* Login/Logout Button - conditional based on user state */}
              {user ? (
                <>
                  {/* Logout Button */}
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      hoveredButton === 'logout' && styles.primaryButtonHover
                    ]}
                    onPress={handleLogout}
                    onPressIn={handlePrimaryPressIn}
                    onPressOut={handlePrimaryPressOut}
                    activeOpacity={1}
                    {...(Platform.OS === 'web' ? {
                      onMouseEnter: () => setHoveredButton('logout'),
                      onMouseLeave: () => setHoveredButton(null)
                    } : {})}
                  >
                    <Animated.View style={[styles.primaryButtonContent, primaryButtonAnimatedStyle]}>
                      <Ionicons name="log-out" size={22} color="#FFFFFF" style={styles.buttonIcon} />
                      <Text style={styles.primaryButtonText}>Logout</Text>
                    </Animated.View>
                  </TouchableOpacity>

                  {/* Return to Dashboard Button */}
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      hoveredButton === 'dashboard' && styles.secondaryButtonHover
                    ]}
                    onPress={handleDashboardPress}
                    onPressIn={handleSecondaryPressIn}
                    onPressOut={handleSecondaryPressOut}
                    activeOpacity={1}
                    {...(Platform.OS === 'web' ? {
                      onMouseEnter: () => setHoveredButton('dashboard'),
                      onMouseLeave: () => setHoveredButton(null)
                    } : {})}
                  >
                    <Ionicons name="home" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.secondaryButtonText}>Return to Dashboard</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    hoveredButton === 'login' && styles.primaryButtonHover
                  ]}
        onPress={validateAndSubmit}
                  onPressIn={handlePrimaryPressIn}
                  onPressOut={handlePrimaryPressOut}
        disabled={isLoading}
                  activeOpacity={1}
                  {...(Platform.OS === 'web' ? {
                    onMouseEnter: () => setHoveredButton('login'),
                    onMouseLeave: () => setHoveredButton(null)
                  } : {})}
                >
                  <Animated.View style={[styles.primaryButtonContent, primaryButtonAnimatedStyle]}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="log-in" size={22} color="#FFFFFF" style={styles.buttonIcon} />
                        <Text style={styles.primaryButtonText}>Login</Text>
                      </>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              )}

              {/* Divider - only show when not logged in */}
              {!user && (
                <>
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Secondary Actions */}
                  <View style={styles.secondaryActionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.secondaryButton, 
                        secondaryButtonAnimatedStyle,
                        hoveredButton === 'signup' && styles.secondaryButtonHover
                      ]}
                      onPress={() => handleButtonPress('/auth/signup')}
                      onPressIn={handleSecondaryPressIn}
                      onPressOut={handleSecondaryPressOut}
                      activeOpacity={1}
                      {...(Platform.OS === 'web' ? {
                        onMouseEnter: () => setHoveredButton('signup'),
                        onMouseLeave: () => setHoveredButton(null)
                      } : {})}
                    >
                      <Ionicons name="person-add" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                      <Text style={styles.secondaryButtonText}>Sign Up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.textButton}
                      onPress={() => handleButtonPress('/')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.textButtonText}>Back to Welcome</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
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
    marginBottom: 32,
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
    fontSize: 16,
    color: '#F0F0F0',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    lineHeight: 24,
    fontWeight: '500',
  },
  formContainer: {
    width: '45%',
    alignSelf: 'center',
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' && {
      outlineWidth: 0,
      outlineStyle: 'none',
      outline: 'none',
    } as any),
  },
  disabledInput: {
    opacity: 0.4,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  disabledInputContainer: {
    opacity: 0.5,
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 10,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'center',  // Changed from 'flex-end' to 'center'
    marginTop: 12,  // Changed from -8 to 12 for proper spacing
    marginBottom: 8,  // Add spacing below
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    marginTop: 8,
    alignSelf: 'center',  // Add this to center the button
    width: '100%',  // 100% of the formContainer width
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  secondaryActionsContainer: {
    gap: 12,
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
    alignSelf: 'center',  // Add this
    width: '100%',  // 100% of the formContainer width
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
    fontSize: 15,  // Reduced from 16
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  textButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textDecorationLine: 'underline',
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
});