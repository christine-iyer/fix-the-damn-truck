import React, {useState} from "react"; 
import { View, Text, StyleSheet , TextInput, Button, Alert, ScrollView} from "react-native";
import {useRouter} from "expo-router"; 
import { useAuth } from "@/contexts/AuthContext";
import { vehicleProfile } from "@/helpers/api";

export default function CarProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user?._id) {
      Alert.alert("Error", "You must be logged in to create a vehicle profile");
      return;
    }

    if (!make || !model || !year) {
      Alert.alert("Error", "Please fill out Make, Model, and Year");
      return;
    }

    // Validate year
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
      Alert.alert("Error", `Year must be between 1900 and ${currentYear + 1}`);
      return;
    }

    // Validate VIN if provided
    if (vin && vin.length !== 17) {
      Alert.alert("Error", "VIN must be exactly 17 characters");
      return;
    }

    setIsLoading(true);

    const payload: any = { 
      make: make.trim(), 
      model: model.trim(), 
      year: yearNum,
      ownerId: user._id 
    };

    // Add optional fields if provided
    if (vin) payload.vin = vin.trim().toUpperCase();
    if (licensePlate) payload.licensePlate = licensePlate.trim().toUpperCase();
    if (color) payload.color = color.trim();

    const result = await vehicleProfile(payload);

    if (result.success) {
      Alert.alert("Success", "Vehicle profile created!", [
        { text: "OK", onPress: () => router.push("/customer/home") }
      ]);
    } else {
      Alert.alert("Error", result.message);
    }

    setIsLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Vehicle</Text>
      <Text style={styles.subtitle}>* Required fields</Text>

      <Text style={styles.label}>Make *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Toyota, Honda, Ford"
        value={make}
        onChangeText={setMake}
      />

      <Text style={styles.label}>Model *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Camry, Civic, F-150"
        value={model}
        onChangeText={setModel}
      />

      <Text style={styles.label}>Year *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 2020"
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
        maxLength={4}
      />

      <Text style={styles.label}>VIN (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="17-character Vehicle Identification Number"
        value={vin}
        onChangeText={setVin}
        autoCapitalize="characters"
        maxLength={17}
      />

      <Text style={styles.label}>License Plate (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., ABC1234"
        value={licensePlate}
        onChangeText={setLicensePlate}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Color (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Black, White, Silver"
        value={color}
        onChangeText={setColor}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? "Submitting..." : "Create Vehicle Profile"}
          onPress={handleSubmit}
          disabled={isLoading || !user?._id}
          color="#007AFF"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#f5f5f5" 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 8,
    color: "#333"
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 10,
    color: "#333"
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    marginBottom: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40
  }
});
