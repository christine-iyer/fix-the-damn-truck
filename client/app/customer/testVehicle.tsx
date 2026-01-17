import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function TestVehicle() {
  const { token } = useAuth();
  const [result, setResult] = useState<string>('');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Camry');
  const [year, setYear] = useState('2020');

  const testCreateVehicle = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/vehicles', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          make,
          model,
          year: parseInt(year),
          color: 'Blue',
          licensePlate: 'ABC123',
        }),
      });

      const data = await response.json();
      setResult(`Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    }
  };

  const testGetVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/vehicles', {
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
      <Text style={styles.title}>🚗 Vehicle API Tester</Text>
      
      <Text style={styles.label}>Make:</Text>
      <TextInput style={styles.input} value={make} onChangeText={setMake} />
      
      <Text style={styles.label}>Model:</Text>
      <TextInput style={styles.input} value={model} onChangeText={setModel} />
      
      <Text style={styles.label}>Year:</Text>
      <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" />
      
      <View style={styles.buttonContainer}>
        <Button title="Create Vehicle" onPress={testCreateVehicle} />
        <Button title="Get My Vehicles" onPress={testGetVehicles} />
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
  label: { fontSize: 16, marginTop: 10, marginBottom: 5 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 10, 
    borderRadius: 5,
    fontSize: 16 
  },
  buttonContainer: { 
    marginTop: 20, 
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'space-around'
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