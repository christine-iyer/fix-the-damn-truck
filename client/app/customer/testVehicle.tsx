import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay } from 'react-native-reanimated';

export default function TestVehicle() {
  const { token } = useAuth();
  const [result, setResult] = useState<string>('');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Camry');
  const [year, setYear] = useState('2020');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'create' | 'get' | null>(null);

  // Hover states
  const [hoveredCreate, setHoveredCreate] = useState(false);
  const [hoveredGet, setHoveredGet] = useState(false);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideYAnim = useSharedValue(30);
  const createButtonScale = useSharedValue(1);
  const createButtonOpacity = useSharedValue(1);

  useEffect(() => {
    fadeAnim.value = withDelay(200, withTiming(1, { duration: 800 }));
    slideYAnim.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
  }, [fadeAnim, slideYAnim]);

  const testCreateVehicle = async () => {
    setIsLoading(true);
    setLoadingAction('create');
    try {
      const response = await fetch('http://localhost:5001/api/vehicles', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          make,
          model,
          year: parseInt(year),
          color: 'Blue',
          licensePlate: 'ABC123',
        }),
      });

      const data = await response.json();
      setResult(`Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const testGetVehicles = async () => {
    setIsLoading(true);
    setLoadingAction('get');
    try {
      const response = await fetch('http://localhost:5001/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      setResult(`Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleCreatePressIn = () => {
    createButtonScale.value = withTiming(0.92, { duration: 150 });
    createButtonOpacity.value = withTiming(0.7, { duration: 150 });
  };

  const handleCreatePressOut = () => {
    createButtonScale.value = withSpring(1, { damping: 10, stiffness: 300 });
    createButtonOpacity.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const createButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: createButtonScale.value }],
    opacity: createButtonOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideYAnim.value }],
  }));

  return (
    <View style={styles.fullScreenContainer}>
      <Image
        source={require('../../assets/images/auto_testVehicle_img_7.png')}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      <View style={styles.overlay} />
      <View style={styles.overlayGradient} />
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.contentWrapper, containerStyle]}>
            {/* Header */}
            <Animated.View style={[styles.header, headerStyle]}>
              <View style={styles.iconCircle}>
                <Ionicons name="car-outline" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Vehicle API Tester</Text>
              <Text style={styles.subtitle}>Test vehicle creation and retrieval</Text>
            </Animated.View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Make Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="car-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Make (e.g., Toyota, Honda, Ford)"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={make}
                  onChangeText={setMake}
                  autoCapitalize="words"
                  underlineColorAndroid="transparent"
                />
              </View>

              {/* Model Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="car-sport-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Model (e.g., Camry, Civic, F-150)"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={model}
                  onChangeText={setModel}
                  autoCapitalize="words"
                  underlineColorAndroid="transparent"
                />
              </View>

              {/* Year Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Year (e.g., 2020)"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                  maxLength={4}
                  underlineColorAndroid="transparent"
                />
              </View>

              {/* Buttons */}
              <Animated.View style={createButtonAnimatedStyle}>
                <TouchableOpacity
                  style={[styles.primaryButton, hoveredCreate && styles.primaryButtonHover]}
                  onPress={testCreateVehicle}
                  onPressIn={handleCreatePressIn}
                  onPressOut={handleCreatePressOut}
                  disabled={isLoading}
                  activeOpacity={1}
                  {...(Platform.OS === 'web' && {
                    onMouseEnter: () => setHoveredCreate(true),
                    onMouseLeave: () => setHoveredCreate(false),
                  })}
                >
                  <Animated.View style={styles.primaryButtonContent}>
                    {isLoading && loadingAction === 'create' ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="add-circle" size={22} color="#FFFFFF" style={styles.buttonIcon} />
                        <Text style={styles.primaryButtonText}>Create Vehicle</Text>
                      </>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                style={[styles.secondaryButton, hoveredGet && styles.secondaryButtonHover]}
                onPress={testGetVehicles}
                disabled={isLoading}
                activeOpacity={0.7}
                {...(Platform.OS === 'web' && {
                  onMouseEnter: () => setHoveredGet(true),
                  onMouseLeave: () => setHoveredGet(false),
                })}
              >
                {isLoading && loadingAction === 'get' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="list" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.secondaryButtonText}>Get My Vehicles</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Result Box */}
              <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                  <Ionicons name="code-outline" size={20} color="#FFFFFF" style={styles.resultIcon} />
                  <Text style={styles.resultHeaderText}>API Response</Text>
                </View>
                <ScrollView style={styles.resultBox} showsVerticalScrollIndicator={true}>
                  <Text style={styles.resultText}>{result || 'Press a button to test...'}</Text>
                </ScrollView>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
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
    paddingVertical: 40,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  formContainer: {
    width: '45%',
    alignSelf: 'center',
    gap: 16,
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
  primaryButton: {
    backgroundColor: '#6B8FA3',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    width: '42%',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonHover: {
    backgroundColor: '#7A9FB3',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    ...(Platform.OS === 'web' && {
      transform: [{ scale: 1.02 }],
    }),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '42%',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    ...(Platform.OS === 'web' && {
      transform: [{ scale: 1.02 }],
    }),
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 0,
  },
  resultContainer: {
    marginTop: 8,
    width: '100%',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  resultIcon: {
    marginRight: 0,
  },
  resultHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  resultBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 16,
    maxHeight: 300,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resultText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 18,
  },
});