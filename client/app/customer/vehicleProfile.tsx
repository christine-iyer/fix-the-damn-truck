import React, {useState} from "react"; 
import { View, Text, StyleSheet , TextInput, Button, Alert} from "react-native";
import {useRouter} from "expo-router"; 
import { useAuth } from "@/contexts/AuthContext";
import { vehicleProfile } from "@/helpers/api";

export default function CarProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user?._id) {
      Alert.alert("Error", "You must be logged in to create a vehicle profile");
      return;
    }

    if (!make || !model || !year) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    setIsLoading(true);

    const payload = { make, model, year, ownerId: user._id };

    const result = await vehicleProfile(payload);

    if (result.success) {
      Alert.alert("Success", "Vehicle profile created!");
      router.push("/customer/home");
    } else {
      Alert.alert("Error", result.message);
    }

    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicle Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Make"
        value={make}
        onChangeText={setMake}
      />

      <TextInput
        style={styles.input}
        placeholder="Model"
        value={model}
        onChangeText={setModel}
      />

      <TextInput
        style={styles.input}
        placeholder="Year"
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
      />

      <Button
        title={isLoading ? "Submitting..." : "Create Profile"}
        onPress={handleSubmit}
        disabled={isLoading || !user?._id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    backgroundColor: "white",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc"
  }
});
