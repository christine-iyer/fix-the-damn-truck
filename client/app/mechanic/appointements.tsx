// 'pending', 'completed', 'rejected', 'question', 'in_progress', 'completed', 'cancelled'
// const string = "Appointements "
// ApptScreen

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE_URL = "http://localhost:5001/api";

export default function ApptScreen() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [requests, setRequests] = useState([]);
  const [questionTexts, setQuestionTexts] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/service-request/mechanic/${user?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const acceptedRequests = data.filter((req: any) => req.status === 'accepted');
      setRequests(acceptedRequests);
      // Initialize questionTexts state
      const initialQuestions: { [key: string]: string } = {};
      acceptedRequests.forEach((req: any) => {
        initialQuestions[req._id] = req.question || "";
      });
      setQuestionTexts(initialQuestions);
    } catch {
      Alert.alert("Error", "Failed to fetch service requests.");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuestion(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/service-request/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: questionTexts[id] }),
      });
      if (res.ok) {
        fetchRequests();
      } else {
        Alert.alert("Error", "Failed to update service request question.");
      }
    } catch {
      Alert.alert("Error", "Failed to update service request question.");
    } finally {
      setActionLoading("");
    }
  }

  function renderRequest({ item }: { item: any }) {
    return (
      <View style={styles.requestContainer}>
        <Text style={styles.requestText}>Request ID: {item._id}</Text>
        <Text style={styles.requestText}>Customer: {item.customer?.username}</Text>
        <Text style={styles.requestText}>Vehicle: {item.vehicle?.make} {item.vehicle?.model} {item.vehicle?.year}</Text>
        <Text style={styles.requestText}>Issue: {item.description}</Text>
        <Text style={styles.requestText}>Question:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ccc', flex: 1, padding: 5, marginRight: 10 }}
            value={questionTexts[item._id]}
            onChangeText={text => setQuestionTexts(q => ({ ...q, [item._id]: text }))}
          />
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuestion(item._id)}
            disabled={actionLoading === item._id}
          >
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accepted Appointments</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item._id}
          renderItem={renderRequest}
          ListEmptyComponent={<Text>No completed appointments found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
  requestContainer: { margin: 10, padding: 10, borderWidth: 1, borderColor: "#ccc" },
  requestText: { fontSize: 16, marginBottom: 5 },
  actions: { flexDirection: "row", justifyContent: "space-around" },
  actionButton: { padding: 10, backgroundColor: "#007BFF", borderRadius: 5 },
  actionButtonText: { color: "#fff", fontWeight: "bold" },
});
