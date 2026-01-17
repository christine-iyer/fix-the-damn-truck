import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert , ScrollView} from "react-native";
import { useAuth } from "../../contexts/AuthContext";



const API_BASE_URL = "http://localhost:5001/api";

export default function MechanicQueueScreen() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    console.log('Logged in user:', user);
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/service-request/mechanic/${user?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: any[] = await res.json(); // Explicitly type data as an array of any
      // Filter requests to only include those with 'pending' status
      const pendingRequests = data.filter((request: any) => request.status === 'pending');
      setRequests(pendingRequests);
    } catch {
      Alert.alert("Error", "Failed to fetch service requests.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(id: string, status: string) {
    setActionLoading(id + status);
    try {
      const res = await fetch(`${API_BASE_URL}/service-request/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchRequests();
      } else {
        Alert.alert("Error", "Failed to update status.");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update status.");
    } finally {
      setActionLoading("");
    }
    
  }

  function renderRequest({ item }: { item: any }) {
    return (
      <View style={styles.card}>
         <Text style={styles.label}>Created: <Text style={styles.value}>{new Date(item.createdAt).toLocaleString()}</Text></Text>

        <Text style={styles.title}>Request: {item.serviceType} ({item.status})</Text>
        <Text style={styles.label}>Customer: <Text style={styles.value}>{item.customer?.username} ({item.customer?.email})</Text></Text>
        <Text style={styles.label}>Vehicle: <Text style={styles.value}>{item.vehicle?.make} {item.vehicle?.model} {item.vehicle?.year}</Text></Text>
        <Text style={styles.label}>License Plate: <Text style={styles.value}>{item.vehicle?.licensePlate}</Text></Text>
        <Text style={styles.label}>Color: <Text style={styles.value}>{item.vehicle?.color}</Text></Text>
        <Text style={styles.label}>Mileage: <Text style={styles.value}>{item.vehicle?.mileage}</Text></Text>
        <Text style={styles.label}>Description: <Text style={styles.value}>{item.description}</Text></Text>
        <Text style={styles.label}>Question: <Text style={styles.value}>{item.question || "-"}</Text></Text>
        <Text style={styles.label}>Priority: <Text style={styles.value}>{item.priority}</Text></Text>
        <Text style={styles.label}>Location: <Text style={styles.value}>{item.location}</Text></Text>
        <Text style={styles.label}>Status: <Text style={styles.value}>{item.status}</Text></Text>
       
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.accept]}
            disabled={actionLoading === item._id + "accepted"}
            onPress={() => handleStatus(item._id, "accepted")}
          >
            <Text style={styles.buttonText}>{actionLoading === item._id + "accepted" ? "Accepting..." : "Accept"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.reject]}
            disabled={actionLoading === item._id + "rejected"}
            onPress={() => handleStatus(item._id, "rejected")}
          >
            <Text style={styles.buttonText}>{actionLoading === item._id + "rejected" ? "Rejecting..." : "Reject"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Service Request Queue</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item._id}
          renderItem={renderRequest}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 40 }}>No service requests found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#007AFF",
  },
  label: {
    fontSize: 15,
    color: "#444",
    marginBottom: 2,
  },
  value: {
    fontWeight: "500",
    color: "#222",
  },
  actions: {
    flexDirection: "row",
    marginTop: 14,
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
    marginLeft: 10,
  },
  accept: {
    backgroundColor: "#28a745",
  },
  reject: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
