// loginScreen 
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Alert, Button, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  //Track email & password values 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // unified alert for web + mobile 
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        showAlert("Success", result.message);
        // Navigation will be handled automatically by AuthContext
      } else {
        showAlert("Error", result.message);
      }
    } catch (error) {
      showAlert("Error", "Network error, try again later");
    } finally {
      setIsLoading(false);
    }
  };

  const validateAndSubmit = () => {
    if (!email || !password) {
      showAlert("Error", "Please fill out all fields");
      return;
    }
    handleLogin();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder='Email'
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder='Password'
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title={isLoading ? "Logging in..." : "Login"}
        onPress={validateAndSubmit}
        disabled={isLoading}
      />
      <Button
        title="Don't have an account? Sign up"
        onPress={() => router.push('/auth/signup')}
      />
      <Button
        title="Back to Welcome"
        onPress={() => router.push('/')}
      />
      <Button
        title="Forgot Password"
        onPress={() => router.push('/auth/forgot-password')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15, width: '80%' }
});
