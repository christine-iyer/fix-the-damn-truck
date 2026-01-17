import React, { useState , useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, ActivityIndicator, Alert, Platform, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

interface Vehicle {
  _id: string; 
  make: string; 
  model: string; 
  year: number; 
  color?: string; 
  licensePlate?: string; 
  isPrimary?: boolean;
}

export default function BookingScreen() {
  const { mechanicId, mechanicName} = useLocalSearchParams<{
    mechanicId?: string; 
    mechanicName?: string; 
  }>(); 

  const {token} = useAuth()
  const router = useRouter()

  const [vehicles, setVehicles] = useState<Vehicle[]>([]); 
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  )
  const [serviceType, setServiceType] = useState("")
  const [description, setDescription] = useState("")
  const [loadingVehicles, setLoadingVehicles] = useState(true)


  // 👉 Fetch vehicles for the logged-in customer
  useEffect(() => {
    if(!token){
      setLoadingVehicles(false);
      return;
    }

    const fetchVehicles = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/vehicles", {
          headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json", 
          }
          }); 

        const data = await res.json()

        if (!res.ok){
          throw new Error(data.message || "Failed to load vehicles"); 
        }

        // backend might return  { vehicles: [] } or just []
        const list = Array.isArray(data) ? data: data.vehicles || []; 
        setVehicles(list);

        // preselect primary vehicle if exists 
        const primary = list.find((v: Vehicle) => v.isPrimary)
        if(primary) setSelectedVehicleId(primary._id); 
      } catch(err:any) {
        console.error("Error fetching vehciles:", err); 
        Alert.alert("Error", err.message || "Failed to load vehicles"); 
      } finally {
        setLoadingVehicles(false)
      }
    };

    fetchVehicles()
  }, [token]);
    
  const handleSubmit = async () => {
    if(!mechanicId) {
      Alert.alert("Error", "Missing mechanic information"); 
      return; 
    }

    if (!selectedVehicleId){
      Alert.alert("Error", "Please select a vehicle"); 
      return
    }

    if (!serviceType || !description){
      Alert.alert("Error", "Please fill in service type and description")
      return; 
    }

    try {
      const res = await fetch("http://localhost:5001/api/service-request", {
        method: "POST", 
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
        }, 
        body: JSON.stringify({
          mechanicId, 
          vehicle: selectedVehicleId, 
          description, 
          serviceType,
          priority: "medium",
        })
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("Service request error:", data);
        throw new Error(data.error || "Failed to create service request")
      }

      Alert.alert("Success", "Service request created!", [
        {
          text: "OK", 
          onPress: () => router.push("/customer/home"), 
        }
      ])
    } catch (err:any) {
      Alert.alert("Error", err.message || "Network error")
    } 
  }; 

  if (loadingVehicles){
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF"/>
        <Text style={styles.loadingText}>Loading your vehicles ...</Text>
      </View>
    )
  }


  if(!vehicles.length){
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          You don't have any vehicles yet. Please add a vehicle before booking. 
        </Text>
        <Button
          title="Go to Vehicle Profile"
          onPress={() => router.push("/customer/vehicleProfile")}
          />
      </View>
    )
  }



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Appointment</Text>

     {/* Vehicle selection */}
     <Text style={styles.sectionTitle}>Select Vehicle</Text>
     <FlatList
      data={vehicles}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => {
        const isSelected = item._id === selectedVehicleId; 
        return(
          <TouchableOpacity
            style={[
              styles.vehicleCard, 
              isSelected && styles.vehicleCardSelected, 
            ]}
            onPress={() => setSelectedVehicleId(item._id)}
            >
            <Text style={styles.vehicleTitle}>
              {item.make} {item.model} ({item.year})
            </Text>
            <Text style={styles.vehicleSubtitle}>
              {item.licensePlate || "No Plate"} {item.color || "No color"}
            </Text>
            {item.isPrimary && <Text>⭐ Primary vehicle</Text>}
            </TouchableOpacity>
        )
      }}
      />
      {/* Service details */}
      <Text style={styles.sectionTitle}>Service Details</Text>

    
      <TextInput
        placeholder="Service Type (e.g. repair maintenance)"
        value={serviceType}
        onChangeText={setServiceType}
        style={styles.input}
        />
      <TextInput
        placeholder="Describe the issue"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, {height: 80}]}
        multiline
        />
        


<Button title="Submit Request" onPress={handleSubmit} color="#007AFF" />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 16, color: "#555" },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  vehicleCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  vehicleCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#e6f0ff",
  },
  vehicleTitle: { fontSize: 16, fontWeight: "600" },
  vehicleSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 8, color: "#555" },
  infoText: { textAlign: "center", marginBottom: 16, fontSize: 16 },
});