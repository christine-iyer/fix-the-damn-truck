import React, {useState, useEffect} from "react"; 
import { View, Text, StyleSheet , TextInput, Alert, ScrollView, TouchableOpacity, ActivityIndicator, Platform, KeyboardAvoidingView} from "react-native";
import {useRouter} from "expo-router"; 
import { useAuth } from "@/contexts/AuthContext";
import { vehicleProfile } from "@/helpers/api";
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay } from 'react-native-reanimated';

export default function CarProfileScreen() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Hover states
  const [hoveredSubmit, setHoveredSubmit] = useState(false);
  const [hoveredCancel, setHoveredCancel] = useState(false);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideYAnim = useSharedValue(30);
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);

  useEffect(() => {
    fadeAnim.value = withDelay(200, withTiming(1, { duration: 800 }));
    slideYAnim.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
  }, [fadeAnim, slideYAnim]);

  const handleSubmit = async () => {
    if (!user?._id) {
      Alert.alert("Error", "You must be logged in to create a vehicle profile");
      return;
    }

    if (!token) {
      Alert.alert("Error", "Authentication token missing");
      return;
    }

    if (!make || !model || !year) {
      Alert.alert("Error", "Please fill out Make, Model, and Year");
      return;
    }

    // Validate year
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
      Alert.alert("Error", `Year must be between 1900 and ${currentYear + 1}`);
      return;
    }

    // Validate VIN if provided
    if (vin && vin.length !== 17) {
      Alert.alert("Error", "VIN must be exactly 17 characters");
      return;
    }

    setIsLoading(true);

    const payload: any = { 
      make: make.trim(), 
      model: model.trim(), 
      year: yearNum
    };

    // Add optional fields if provided
    if (vin) payload.vin = vin.trim().toUpperCase();
    if (licensePlate) payload.licensePlate = licensePlate.trim().toUpperCase();
    if (color) payload.color = color.trim();

    const result = await vehicleProfile(payload);

    if (result.success) {
      Alert.alert("Success", "Vehicle profile created!", [
        { text: "OK", onPress: () => router.push("/customer/home") }
      ]);
    } else {
      Alert.alert("Error", result.message);
    }

    setIsLoading(false);
  };

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.92, { duration: 150 });
    buttonOpacity.value = withTiming(0.7, { duration: 150 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 10, stiffness: 300 });
    buttonOpacity.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
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
        source={require('../../assets/images/auto_vehicleProfile_img_6.png')}
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
                <Ionicons name="car-sport" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Add Vehicle</Text>
              <Text style={styles.subtitle}>* Required fields</Text>
            </Animated.View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Make Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="car-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Make * (e.g., Toyota, Honda, Ford)"
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
                  placeholder="Model * (e.g., Camry, Civic, F-150)"
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
                  placeholder="Year * (e.g., 2020)"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                  maxLength={4}
                  underlineColorAndroid="transparent"
                />
              </View>

              {/* VIN Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="barcode-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="VIN (Optional - 17 characters)"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={vin}
                  onChangeText={setVin}
                  autoCapitalize="characters"
                  maxLength={17}
                  underlineColorAndroid="transparent"
                />
              </View>

              {/* License Plate Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="document-text-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="License Plate (Optional)"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={licensePlate}
                  onChangeText={setLicensePlate}
                  autoCapitalize="characters"
                  underlineColorAndroid="transparent"
                />
              </View>

              {/* Color Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="color-palette-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Color (Optional - e.g., Black, White, Silver)"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={color}
                  onChangeText={setColor}
                  autoCapitalize="words"
                  underlineColorAndroid="transparent"
                />
              </View>

              {/* Submit Button */}
              <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity
                  style={[styles.primaryButton, hoveredSubmit && styles.primaryButtonHover]}
                  onPress={handleSubmit}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={isLoading || !user?._id || !token}
                  activeOpacity={1}
                  {...(Platform.OS === 'web' && {
                    onMouseEnter: () => setHoveredSubmit(true),
                    onMouseLeave: () => setHoveredSubmit(false),
                  })}
                >
                  <Animated.View style={styles.primaryButtonContent}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" style={styles.buttonIcon} />
                        <Text style={styles.primaryButtonText}>Create Vehicle Profile</Text>
                      </>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.secondaryButton, hoveredCancel && styles.secondaryButtonHover]}
                onPress={() => router.push("/customer/home")}
                activeOpacity={0.7}
                {...(Platform.OS === 'web' && {
                  onMouseEnter: () => setHoveredCancel(true),
                  onMouseLeave: () => setHoveredCancel(false),
                })}
              >
                <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
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
  primaryButtonHover: {
    backgroundColor: '#7A9FB3',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    ...(Platform.OS === 'web' && {
      transform: [{ scale: 1.02 }],
    }),
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
});
