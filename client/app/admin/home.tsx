import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  FlatList
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

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
  const { user, logout, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // Real API data state
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

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
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: logout
        }
      ]
    );
  };

  // Fetch stats when component mounts
  useEffect(() => {
    if (user) {
      fetchQuickStats();
    }
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

  const renderQuickStat = (stat: QuickStat) => (
    <View key={stat.title} style={[styles.statCard, { borderLeftColor: stat.color }]}>
      <Text style={styles.statIcon}>{stat.icon}</Text>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statTitle}>{stat.title}</Text>
    </View>
  );

  const renderPendingUser = ({ item }: { item: PendingUser; }) => (
    <View style={styles.pendingUserCard}>
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
    <View style={styles.activityItem}>
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
        <Text style={styles.statusText}>Status: {user?.status?.toUpperCase()}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        {statsLoading ? (
          <View style={styles.loadingContainer}>
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
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>👥</Text>
            <Text style={styles.quickActionText}>Manage Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>⚙️</Text>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowUserModal(true)}
          >
            <Text style={styles.quickActionIcon}>📢</Text>
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
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Announcement Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Announcement</Text>
            <TextInput
              style={styles.announcementInput}
              placeholder="Enter your announcement..."
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: '#333',
    marginBottom: 8
  },
  welcomeText: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 4
  },
  statusText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500'
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 15
  },
  viewAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  pendingUsersList: {
    paddingRight: 20
  },
  pendingUserCard: {
    width: 280,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  userInfo: {
    flex: 1,
    marginBottom: 15
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  userRole: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4
  },
  userDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  userDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 4
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  approveButton: {
    backgroundColor: '#34C759'
  },
  rejectButton: {
    backgroundColor: '#FF3B30'
  },
  approveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center'
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  activityEmoji: {
    fontSize: 20
  },
  activityContent: {
    flex: 1
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4
  },
  activityUser: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  activityTime: {
    fontSize: 11,
    color: '#999'
  },
  footer: {
    padding: 20,
    paddingBottom: 40
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center'
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  announcementInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontSize: 16
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5
  },
  cancelButton: {
    backgroundColor: '#f0f0f0'
  },
  sendButton: {
    backgroundColor: '#007AFF'
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500'
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic'
  }
});
