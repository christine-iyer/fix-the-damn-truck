import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay } from 'react-native-reanimated';

interface QuickStat {
  title: string;
  value: string;
  color: string;
  icon: string;
}

interface PendingUser {
  id: string;
  username: string;
  email: string;
  role: string;
  specialty?: string;
  department?: string;
  createdAt: string;
}

export default function AdminHomeScreen() {
  const router = useRouter();
  const { user, logout, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // Real API data state
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Hover states for web hover effects
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredPendingUser, setHoveredPendingUser] = useState<string | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideYAnim = useSharedValue(30);

  useEffect(() => {
    fadeAnim.value = withDelay(200, withTiming(1, { duration: 800 }));
    slideYAnim.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
  }, [fadeAnim, slideYAnim]);

  // Fetch quick stats from API
  const fetchQuickStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('http://localhost:5001/api/admin/users/stats', {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuickStats([
          { title: "Total Users", value: data.totalUsers?.toString() || "0", color: "#007AFF", icon: "👥" },
          { title: "Pending Approvals", value: data.statusBreakdown.approved?.toString() || "0", color: "#FF9500", icon: "⏳" },
          { title: "Active Services", value: data.activeServices?.toString() || "0", color: "#34C759", icon: "🔧" },
          { title: "Today's Revenue", value: `$${data.todayRevenue?.toLocaleString() || "0"}`, color: "#30D158", icon: "💰" }
        ]);
      } else {
        // Fallback to default values if API fails
        setQuickStats([
          { title: "Total Users", value: "0", color: "#007AFF", icon: "👥" },
          { title: "Pending Approvals", value: "0", color: "#FF9500", icon: "⏳" },
          { title: "Active Services", value: "0", color: "#34C759", icon: "🔧" },
          { title: "Today's Revenue", value: "$0", color: "#30D158", icon: "💰" }
        ]);
      }
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      // Fallback to default values on error
      setQuickStats([
        { title: "Total Users", value: "0", color: "#007AFF", icon: "👥" },
        { title: "Pending Approvals", value: "0", color: "#FF9500", icon: "⏳" },
        { title: "Active Services", value: "0", color: "#34C759", icon: "🔧" },
        { title: "Today's Revenue", value: "$0", color: "#30D158", icon: "💰" }
      ]);
    } finally {
      setStatsLoading(false);
    }
  };

  const pendingUsers: PendingUser[] = [
    {
      id: "1",
      username: "john_mechanic",
      email: "john@example.com",
      role: "mechanic",
      specialty: "Engine Repair",
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      username: "sarah_admin",
      email: "sarah@example.com",
      role: "admin",
      department: "Operations",
      createdAt: "2024-01-14"
    }
  ];

  const recentActivity = [
    { id: "1", action: "New mechanic registered", user: "Mike Johnson", time: "2 min ago" },
    { id: "2", action: "Service completed", user: "AutoFix Pro", time: "15 min ago" },
    { id: "3", action: "Customer complaint", user: "Jane Smith", time: "1 hour ago" },
    { id: "4", action: "Payment processed", user: "Bob's Garage", time: "2 hours ago" }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Fetch stats when component mounts
  useEffect(() => {
    if (user) {
      fetchQuickStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch fresh data from API
    await fetchQuickStats();
    setRefreshing(false);
  };

  const handleApproveUser = (userId: string) => {
    Alert.alert(
      "Approve User",
      "Are you sure you want to approve this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: () => {
            // API call to approve user
            Alert.alert("Success", "User approved successfully!");
          }
        }
      ]
    );
  };

  const handleRejectUser = (userId: string) => {
    Alert.alert(
      "Reject User",
      "Are you sure you want to reject this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => {
            // API call to reject user
            Alert.alert("Success", "User rejected successfully!");
          }
        }
      ]
    );
  };

  const handleSendAnnouncement = () => {
    if (!announcement.trim()) {
      Alert.alert("Error", "Please enter an announcement");
      return;
    }

    Alert.alert(
      "Send Announcement",
      "Are you sure you want to send this announcement to all users?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            // API call to send announcement
            Alert.alert("Success", "Announcement sent successfully!");
            setAnnouncement("");
          }
        }
      ]
    );
  };

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideYAnim.value }],
  }));

  const renderQuickStat = (stat: QuickStat) => (
    <View 
      key={stat.title} 
      style={[
        styles.statCard, 
        { borderLeftColor: stat.color },
        hoveredCard === stat.title && styles.statCardHover
      ]}
      {...(Platform.OS === 'web' ? {
        onMouseEnter: () => setHoveredCard(stat.title),
        onMouseLeave: () => setHoveredCard(null)
      } : {})}
    >
      <Text style={styles.statIcon}>{stat.icon}</Text>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statTitle}>{stat.title}</Text>
    </View>
  );

  const renderPendingUser = ({ item }: { item: PendingUser; }) => (
    <View 
      style={[
        styles.pendingUserCard,
        hoveredPendingUser === item.id && styles.pendingUserCardHover
      ]}
      {...(Platform.OS === 'web' ? {
        onMouseEnter: () => setHoveredPendingUser(item.id),
        onMouseLeave: () => setHoveredPendingUser(null)
      } : {})}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>Role: {item.role.toUpperCase()}</Text>
        {item.specialty && <Text style={styles.userDetail}>Specialty: {item.specialty}</Text>}
        {item.department && <Text style={styles.userDetail}>Department: {item.department}</Text>}
        <Text style={styles.userDate}>Registered: {item.createdAt}</Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApproveUser(item.id)}
        >
          <Text style={styles.approveButtonText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectUser(item.id)}
        >
          <Text style={styles.rejectButtonText}>✗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActivityItem = ({ item }: { item: any; }) => (
    <View 
      style={[
        styles.activityItem,
        hoveredActivity === item.id && styles.activityItemHover
      ]}
      {...(Platform.OS === 'web' ? {
        onMouseEnter: () => setHoveredActivity(item.id),
        onMouseLeave: () => setHoveredActivity(null)
      } : {})}
    >
      <View style={styles.activityIcon}>
        <Text style={styles.activityEmoji}>📋</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityAction}>{item.action}</Text>
        <Text style={styles.activityUser}>{item.user}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/auto_admin_img_4.png')} 
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      
      {/* Gradient overlay layers */}
      <View style={styles.overlay} />
      <View style={styles.overlayGradient} />
      
      {/* Glassmorphism blur effect */}
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.contentWrapper, containerStyle]}>
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <View style={styles.iconCircle}>
              <Ionicons name="car-sport" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, user?.status === 'approved' && styles.statusApproved]}>
                <Text style={styles.statusText}>Status: {user?.status?.toUpperCase()}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            {statsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading stats...</Text>
              </View>
            ) : (
              <View style={styles.statsGrid}>
                {quickStats.map(renderQuickStat)}
              </View>
            )}
          </View>

          {/* Pending Approvals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Approvals</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
        <FlatList
          data={pendingUsers}
          renderItem={renderPendingUser}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pendingUsersList}
        />
      </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={[
                  styles.quickActionButton,
                  hoveredButton === 'manageUsers' && styles.quickActionButtonHover
                ]}
                {...(Platform.OS === 'web' ? {
                  onMouseEnter: () => setHoveredButton('manageUsers'),
                  onMouseLeave: () => setHoveredButton(null)
                } : {})}
              >
                <Ionicons name="people" size={28} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Manage Users</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.quickActionButton,
                  hoveredButton === 'analytics' && styles.quickActionButtonHover
                ]}
                {...(Platform.OS === 'web' ? {
                  onMouseEnter: () => setHoveredButton('analytics'),
                  onMouseLeave: () => setHoveredButton(null)
                } : {})}
              >
                <Ionicons name="stats-chart" size={28} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Analytics</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.quickActionButton,
                  hoveredButton === 'settings' && styles.quickActionButtonHover
                ]}
                {...(Platform.OS === 'web' ? {
                  onMouseEnter: () => setHoveredButton('settings'),
                  onMouseLeave: () => setHoveredButton(null)
                } : {})}
              >
                <Ionicons name="settings" size={28} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  hoveredButton === 'announce' && styles.quickActionButtonHover
                ]}
                onPress={() => setShowUserModal(true)}
                {...(Platform.OS === 'web' ? {
                  onMouseEnter: () => setHoveredButton('announce'),
                  onMouseLeave: () => setHoveredButton(null)
                } : {})}
              >
                <Ionicons name="megaphone" size={28} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Announce</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <FlatList
              data={recentActivity}
              renderItem={renderActivityItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* Logout Button */}
          <View style={styles.section}>
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

      {/* Announcement Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Announcement</Text>
            <TextInput
              style={styles.announcementInput}
              placeholder="Enter your announcement..."
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={announcement}
              onChangeText={setAnnouncement}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowUserModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleSendAnnouncement}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 50, 100, 0.15)',
  },
  scrollView: {
    flex: 1,
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
    marginTop: 8,
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
  section: {
    marginBottom: 12,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#6B8FA3',
    borderRadius: 12,
    shadowColor: '#6B8FA3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  statCardHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    transform: [{ translateY: -3 }],
    shadowOpacity: 0.3,
    shadowRadius: 12,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
  },
  statTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600'
  },
  pendingUsersList: {
    paddingRight: 20
  },
  pendingUserCard: {
    width: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 18,
    borderRadius: 16,
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  pendingUserCardHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
    transform: [{ translateY: -3 }],
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  userInfo: {
    flex: 1,
    marginBottom: 15
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4
  },
  userRole: {
    fontSize: 12,
    color: '#6B8FA3',
    fontWeight: '600',
    marginBottom: 4
  },
  userDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2
  },
  userDate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  approveButton: {
    backgroundColor: '#34C759'
  },
  rejectButton: {
    backgroundColor: '#FF3B30'
  },
  approveButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12
  },
  quickActionButton: {
    width: '42%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  quickActionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  activityItemHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  activityEmoji: {
    fontSize: 22
  },
  activityContent: {
    flex: 1
  },
  activityAction: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
  },
  activityUser: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2
  },
  activityTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)'
  },
  footer: {
    padding: 20,
    paddingBottom: 40
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  announcementInput: {
    borderWidth: 2,
    borderColor: 'rgba(107, 143, 163, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    minHeight: 120
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)'
  },
  sendButton: {
    backgroundColor: '#6B8FA3'
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '700'
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: 12
  }
});
