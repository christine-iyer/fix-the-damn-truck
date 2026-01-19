import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay } from 'react-native-reanimated';


interface Mechanic {
  _id: string; 
  name: string; 
  email: string; 
  phoneNumber: string ; 
  specialization: string ;
  experience: number; 
  rating: number; 
}

export default function CustomerHomeScreen() {
  const router = useRouter()
  const { user, token , isLoading} = useAuth();

  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null)

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideYAnim = useSharedValue(30);
  
  // Hover states for web hover effects
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    fadeAnim.value = withDelay(200, withTiming(1, { duration: 800 }));
    slideYAnim.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
  }, [fadeAnim, slideYAnim]);

  useEffect(() => {
    // wait for auth to finish loading 
    if (isLoading){
      console.log("⏳ Auth is loading, waiting...")
      return; 
    }

    // Check is token exists after auth is ready 
    if(!token){
      console.log("❌ No token available")
      setError("Not authenticated"); 
      return 
    }

    const fetchMechanics = async () => {
      console.log("✅ Fetching mechanics with token");
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("http://localhost:5001/api/list/mechanics", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        setMechanics(data);
      } catch (error) {
        console.error("Error fetching mechanics:", error);
        setError(error instanceof Error ? error.message: "Failed to load mechanics")
      } finally {
        setLoading(false);
      }
    };

    fetchMechanics();
  }, [token, isLoading]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideYAnim.value }],
  }));

  if (loading) {
    return (
      <View style={styles.centered}>
        <Image 
          source={require('../../assets/images/auto_login_img_2.png')} 
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
        <View style={styles.overlay} />
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading mechanics...</Text>
      </View>
    );
  }

  if (error){
    return(
      <View style={styles.centered}>
        <Image 
          source={require('../../assets/images/auto_login_img_2.png')} 
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
        <View style={styles.overlay} />
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/auto_login_img_2.png')} 
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      
      {/* Gradient overlay layers */}
      <View style={styles.overlay} />
      <View style={styles.overlayGradient} />
      
      {/* Glassmorphism blur effect */}
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.contentWrapper, containerStyle]}>
          {/* Header Card */}
          <Animated.View style={[styles.header, headerStyle]}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-circle" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Customer Dashboard</Text>
            <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.roleText}>Role: {user?.role?.toUpperCase()}</Text>
              <View style={[styles.statusBadge, user?.status === 'approved' && styles.statusApproved]}>
                <Text style={styles.statusText}>Status: {user?.status}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                hoveredButton === 'vehicleProfile' && styles.actionButtonHover
              ]}
              onPress={() => router.push("/customer/vehicleProfile")}
              {...(Platform.OS === 'web' ? {
                onMouseEnter: () => setHoveredButton('vehicleProfile'),
                onMouseLeave: () => setHoveredButton(null)
              } : {})}
            >
              <Ionicons name="car" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.actionButtonText}>Vehicle Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.actionButtonSecondary,
                hoveredButton === 'testVehicle' && styles.actionButtonSecondaryHover
              ]}
              onPress={() => router.push("./testVehicle" as any)}
              {...(Platform.OS === 'web' ? {
                onMouseEnter: () => setHoveredButton('testVehicle'),
                onMouseLeave: () => setHoveredButton(null)
              } : {})}
            >
              <Ionicons name="car-sport" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.actionButtonText}>Test Vehicle API</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.actionButtonSecondary,
                hoveredButton === 'testService' && styles.actionButtonSecondaryHover
              ]}
              onPress={() => router.push("./testServiceRequest" as any)}
              {...(Platform.OS === 'web' ? {
                onMouseEnter: () => setHoveredButton('testService'),
                onMouseLeave: () => setHoveredButton(null)
              } : {})}
            >
              <Ionicons name="construct" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.actionButtonText}>Test Service Request</Text>
            </TouchableOpacity>
          </View>

          {/* Services Section */}
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Available Services</Text>
            <Text style={styles.description}>
              Book appointments, track your vehicle service history, and manage your account.
            </Text>
            
            <Text style={styles.mechanicsTitle}>Available Mechanics</Text>
            <FlatList
              data={mechanics}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View 
                  style={[
                    styles.mechanicCard,
                    hoveredCard === item._id && styles.mechanicCardHover
                  ]}
                  {...(Platform.OS === 'web' ? {
                    onMouseEnter: () => setHoveredCard(item._id),
                    onMouseLeave: () => setHoveredCard(null)
                  } : {})}
                >
                  <View style={styles.mechanicHeader}>
                    <Ionicons name="person" size={24} color="#6B8FA3" />
                    <Text style={styles.mechanicName}>{item.name}</Text>
                  </View>
                  
                  <View style={styles.mechanicInfo}>
                    <View style={styles.mechanicInfoRow}>
                      <Ionicons name="mail-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                      <Text style={styles.mechanicEmail}>{item.email}</Text>
                    </View>
                    
                    {item.phoneNumber && (
                      <View style={styles.mechanicInfoRow}>
                        <Ionicons name="call-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                        <Text style={styles.mechanicPhone}>{item.phoneNumber}</Text>
                      </View>
                    )}
                    
                    {item.specialization && (
                      <View style={styles.mechanicInfoRow}>
                        <Ionicons name="build-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                        <Text style={styles.mechanicSpecialization}>{item.specialization}</Text>
                      </View>
                    )}
                  </View>
                  
                  <TouchableOpacity 
                    style={[
                      styles.bookButton,
                      hoveredButton === `book-${item._id}` && styles.bookButtonHover
                    ]}
                    onPress={() => 
                      router.push({
                        pathname: "/customer/booking",  
                        params: {
                          mechanicId: item._id, 
                          mechanicName: item.name, 
                        }
                      })
                    }
                    {...(Platform.OS === 'web' ? {
                      onMouseEnter: () => setHoveredButton(`book-${item._id}`),
                      onMouseLeave: () => setHoveredButton(null)
                    } : {})}
                  >
                    <Ionicons name="calendar" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.bookButtonText}>Book Appointment</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="construct-outline" size={48} color="rgba(255, 255, 255, 0.5)" />
                  <Text style={styles.emptyText}>No mechanics available</Text>
                </View>
              }
            />
          </View>
        </Animated.View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  contentWrapper: {
    gap: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 15,
    color: '#F0F0F0',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  roleText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusApproved: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actions: {
    gap: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#6B8FA3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#6B8FA3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    alignSelf: 'center',
    width: '42%',
  },
  actionButtonHover: {
    backgroundColor: '#7BA8BD',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.7,
    shadowRadius: 16,
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  actionButtonSecondaryHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  content: {
    marginBottom: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
  },
  mechanicsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
  },
  mechanicCard: {
    padding: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  mechanicCardHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
    transform: [{ translateY: -3 }],
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  mechanicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  mechanicName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
  },
  mechanicInfo: {
    gap: 8,
    marginBottom: 16,
  },
  mechanicInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mechanicEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  mechanicPhone: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  mechanicSpecialization: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  bookButton: {
    backgroundColor: '#6B8FA3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
    shadowColor: '#6B8FA3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'center',
    width: '42%',
  },
  bookButtonHover: {
    backgroundColor: '#7BA8BD',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 16,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
  },
});
