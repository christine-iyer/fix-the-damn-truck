import React, { useEffect, useState } from "react";
import {View , Text, TouchableOpacity, Alert, StyleSheet , Platform, ScrollView, Linking} from "react-native"; 
import {useAuth} from "../contexts/AuthContext";
import { useRouter } from "expo-router";
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay } from 'react-native-reanimated';

export default function SettingScreen() {
    const router = useRouter();
    const { user , logout} = useAuth(); 

    // State for showing/hiding Friends and Info section
    const [showFriendsInfo, setShowFriendsInfo] = React.useState(false);
    
    // Hover states for web hover effects
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);

    // Animation values
    const fadeAnim = useSharedValue(0);
    const slideYAnim = useSharedValue(30);

    useEffect(() => {
        fadeAnim.value = withDelay(200, withTiming(1, { duration: 800 }));
        slideYAnim.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
    }, [fadeAnim, slideYAnim]);

    const showAlert = (title: string, message: string) => {
        if (Platform.OS === "web") {
            window.alert(`${title}: ${message}`)
        } else {
            Alert.alert(title, message);
        }
    }

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/');
        } catch (error: any) { 
            console.error('Logout error:', error);
            showAlert("Logout Failed", error?.message || "Something went wrong.");
        }
    };

    const handleInstagram = () => {
        const instagramUrl = "https://www.instagram.com"; // Replace with actual Instagram URL
        Linking.openURL(instagramUrl).catch(err => {
            showAlert("Error", "Could not open Instagram");
        });
    };

    const handleLinkedIn = () => {
        const linkedInUrl = "https://www.linkedin.com"; // Replace with actual LinkedIn URL
        Linking.openURL(linkedInUrl).catch(err => {
            showAlert("Error", "Could not open LinkedIn");
        });
    };

    // Animated styles
    const containerStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
    }));

    const headerStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
        transform: [{ translateY: slideYAnim.value }],
    }));

    return(
        <View style={styles.container}>
            <Image 
                source={require('../assets/images/auto_logout_img_5.png')} 
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
                    {/* Header */}
                    <Animated.View style={[styles.header, headerStyle]}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="settings" size={40} color="#FFFFFF" />
                        </View>
                        <Text style={styles.title}>Settings</Text>
                        {user && (
                            <Text style={styles.welcomeText}>Welcome, {user.username}!</Text>
                        )}
                    </Animated.View>

                    {/* Friends and Info Button */}
                    <View style={styles.buttonWrapper}>
                        <TouchableOpacity 
                            style={[
                                styles.friendsInfoButton,
                                hoveredButton === 'friends' && styles.friendsInfoButtonHover
                            ]}
                            onPress={() => setShowFriendsInfo(!showFriendsInfo)}
                            {...(Platform.OS === 'web' ? {
                                onMouseEnter: () => setHoveredButton('friends'),
                                onMouseLeave: () => setHoveredButton(null)
                            } : {})}
                        >
                            <Ionicons name="people" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                            <Text style={styles.friendsInfoButtonText}>Friends and Info</Text>
                            <Ionicons 
                                name={showFriendsInfo ? "chevron-up" : "chevron-down"} 
                                size={20} 
                                color="#FFFFFF" 
                                style={styles.chevronIcon} 
                            />
                        </TouchableOpacity>

                        {/* Social Links - shown when expanded */}
                        {showFriendsInfo && (
                            <View style={styles.socialButtonsContainer}>
                                <TouchableOpacity 
                                    style={[
                                        styles.socialButton,
                                        hoveredButton === 'instagram' && styles.socialButtonHover
                                    ]}
                                    onPress={handleInstagram}
                                    {...(Platform.OS === 'web' ? {
                                        onMouseEnter: () => setHoveredButton('instagram'),
                                        onMouseLeave: () => setHoveredButton(null)
                                    } : {})}
                                >
                                    <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                                    <Text style={styles.socialButtonText}>Instagram</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[
                                        styles.socialButton,
                                        hoveredButton === 'linkedin' && styles.socialButtonHover
                                    ]}
                                    onPress={handleLinkedIn}
                                    {...(Platform.OS === 'web' ? {
                                        onMouseEnter: () => setHoveredButton('linkedin'),
                                        onMouseLeave: () => setHoveredButton(null)
                                    } : {})}
                                >
                                    <Ionicons name="logo-linkedin" size={20} color="#0077B5" />
                                    <Text style={styles.socialButtonText}>LinkedIn</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Logout Button */}
                    <View style={styles.buttonWrapper}>
                        <TouchableOpacity 
                            style={[
                                styles.logoutButton,
                                hoveredButton === 'logout' && styles.logoutButtonHover
                            ]}
                            onPress={handleLogout}
                            {...(Platform.OS === 'web' ? {
                                onMouseEnter: () => setHoveredButton('logout'),
                                onMouseLeave: () => setHoveredButton(null)
                            } : {})}
                        >
                            <Ionicons name="log-out" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    )
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
    padding: 16,
    justifyContent: 'center',
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
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  buttonWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  friendsInfoButton: {
    backgroundColor: '#6B8FA3',
    padding: 14,
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
  friendsInfoButtonHover: {
    backgroundColor: '#7BA8BD',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.7,
    shadowRadius: 16,
  },
  friendsInfoButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  socialButtonsContainer: {
    gap: 10,
    marginTop: 12,
  },
  socialButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    alignSelf: 'center',
    width: '42%',
  },
  socialButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
  },
  logoutButton: {
    backgroundColor: '#6B8FA3',
    padding: 14,
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
  logoutButtonHover: {
    backgroundColor: '#7BA8BD',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.7,
    shadowRadius: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});