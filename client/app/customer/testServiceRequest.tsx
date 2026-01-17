import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function TestServiceRequest() {
  const { token, user } = useAuth();
  const [result, setResult] = useState<string>('');
  const [description, setDescription] = useState('Oil change needed');
  const [serviceType, setServiceType] = useState("repair")
  
  // Your actual IDs from the tests
  const vehicleId = '690d0514a71b85664b5aa9b1'; // From your vehicle test result
  const customerId = '6907f546a55a8194552722ba'; // Your customer ID

  const testCreateServiceRequest = async () => {
    try {
      // First, get a mechanic ID
      const mechanicsRes = await fetch('http://localhost:5001/api/list/mechanics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mechanics = await mechanicsRes.json();
      const firstMechanic = mechanics[0]?._id;

      if (!firstMechanic) {
        setResult('❌ No mechanics found');
        return;
      }

      // Create service request
      const response = await fetch('http://localhost:5001/api/service-request', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mechanicId: firstMechanic,
          vehicle: vehicleId, // Your vehicle ID
          description: description,
          serviceType: serviceType 
        }),
      });

      const data = await response.json();
      setResult(`Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    }
  };

  const testGetMyServiceRequests = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/service-request/customer/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      setResult(`Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Service Request API Tester</Text>
      
      <Text style={styles.info}>Vehicle ID: {vehicleId}</Text>
      <Text style={styles.info}>Customer ID: {customerId}</Text>
      
      <Text style={styles.label}>Description:</Text>
      <TextInput 
        style={styles.input} 
        value={description} 
        onChangeText={setDescription}
        multiline
      />
      
      <View style={styles.buttonContainer}>
        <Button title="Create Service Request" onPress={testCreateServiceRequest} />
        <Button title="Get My Requests" onPress={testGetMyServiceRequests} />
      </View>
      
      <ScrollView style={styles.resultBox}>
        <Text style={styles.resultText}>{result || 'Press a button to test...'}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  info: { fontSize: 12, color: '#666', marginBottom: 5, fontFamily: 'monospace' },
  label: { fontSize: 16, marginTop: 10, marginBottom: 5 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 10, 
    borderRadius: 5,
    fontSize: 16,
    minHeight: 60,
  },
  buttonContainer: { 
    marginTop: 20, 
    gap: 10,
  },
  resultBox: { 
    marginTop: 20, 
    padding: 15, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 8,
    maxHeight: 300,
  },
  resultText: { fontFamily: 'monospace', fontSize: 12 },
});