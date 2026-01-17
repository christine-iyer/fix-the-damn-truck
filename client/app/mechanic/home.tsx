import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";


export default function MechanicHomeScreen() {
  const router = useRouter()
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mechanic Dashboard</Text>
        <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
        <Text style={styles.roleText}>Role: {user?.role?.toUpperCase()}</Text>
        <Text style={styles.statusText}>Status: {user?.status}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Your Tools</Text>
        <Text style={styles.description}>
          Manage your appointments, view vehicle histories, and update your profile.
        </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => router.push("/mechanic/queue")}
                >
                <Text>Manage Queue</Text>
              </TouchableOpacity>
      
              <TouchableOpacity
                onPress={() => router.push("/mechanic/appointements")}
                >
                <Text>View Appointments</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/mechanic/upload")}
                >
                <Text>Manage Uploads</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/mechanic/confirmation")}
                >
                <Text>Manage Confirmations</Text>
              </TouchableOpacity>

               <TouchableOpacity
                onPress={() => router.push("/mechanic/profile")}
                >
                <Text>Manage Profile</Text>
              </TouchableOpacity>

            </View>
            </View>
          </View>
        );
      }
      
      const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
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
    marginBottom: 10
  },
  welcomeText: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 5
  },
  roleText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5
  },
  statusText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500'
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24
  },
  footer: {
    marginTop: 20,
    padding: 20
  }, 
  actions: {
    marginTop:20, 
    flexDirection:"column", 
    justifyContent: 'space-between', 
    gap:10, 
  }
});

