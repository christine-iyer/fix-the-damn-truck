import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import TestVehicleAPI from "./testVehicle";


interface Mechanic {
  _id: string; 
  name: string; 
  email: string; 
  phoneNumber: string ; 
  specialization: string ;
  experience: Number; 
  rating: Number; 
}

export default function CustomerHomeScreen() {
  const router = useRouter()
  const { user, token , isLoading} = useAuth();

  // state for all users 
  const [users, setUsers] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null)

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
  }, [token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Loading mechanics...</Text>
      </View>
    );
  }

  if (error){
    return(
      <View style = {styles.centered}>
        <ActivityIndicator size="large" color = "##007AFF">
          <Text style = {styles.errorText}> {error}</Text>
        </ActivityIndicator>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Dashboard</Text>
        <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
        <Text>Role: {user?.role?.toUpperCase()}</Text>
        <Text style={styles.statusText}>Status: {user?.status}</Text>
      </View>

      <View style={styles.actions}>
  <Button 
    title="Vehicle Profile"
    onPress={() => router.push("/customer/vehicleProfile")}
  />
  
  <Button 
    title="🚗 Test Vehicle API"
    onPress={() => router.push("./testVehicle" as any)}
    color="#FF6B6B"
  />
  
  <Button 
    title="🔧 Test Service Request API"
    onPress={() => router.push("./testServiceRequest" as any)}
    color="#4ECDC4"
  />
</View>




      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Available Services</Text>
        <Text style={styles.description}>
          Book appointments, track your vehicle service history, and manage your account.
        </Text>
      <Text style={styles.title}>Available Mechanics</Text>
      <FlatList
        data={mechanics}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.mechanicCard}>
            <Text style={styles.mechanicName}>{item.name}</Text>
            <Text style={styles.mechanicEmail}>{item.email}</Text>
            {item.phoneNumber && (
              <Text style = {styles.mechanicPhone}> {item.phoneNumber}</Text>
            )}
            {item.specialization && (
              <Text style= {styles.mechanicSpecialization}>
                {item.specialization}
              </Text>
            )}
              
              
            <Button 
              title="Book Appointment"
              onPress={() => 
                router.push({
                  pathname: "/customer/booking",  
                  params: {
                    mechanicId: item._id, 
                    mechanicName: item.name, 
                  }
                })
              }
              />

          </View>
        )}

        ListEmptyComponent={
          <Text style={styles.emptyText}>No mechanics available</Text>
        }
      />
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
  }, 
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  mechanicCard: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  mechanicName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  mechanicEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  mechanicPhone: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 4,
  },
  mechanicSpecialization: {
    fontSize: 14,
    color: "#28a745",
    marginTop: 4,
    fontStyle: "italic",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontSize: 16,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
});
