// signupScreen
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Platform, StyleSheet, Text, TextInput, View, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

type UserRole = 'admin' | 'customer' | 'mechanic';

export default function SignUp() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      // Only send required fields for all roles
      const userData = {
        username,
        email,
        password,
        role: selectedRole,
      };
      const result = await register(userData);

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
    // Check all required fields are filled
    if (!email || !username || !password || !confirmPassword) {
      showAlert("Error", "Please fill out all fields");
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    // If validation passes, call signup function
    handleSignUp();
  };

  const renderRoleSpecificFields = () => null;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      marginBottom: 15,
      width: "100%"
    },
    roleContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      width: '100%',
      justifyContent: 'space-around'
    },
    roleButton: {
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ccc',
      minWidth: 80,
      alignItems: 'center'
    },
    selectedRoleButton: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF'
    },
    roleButtonText: {
      fontSize: 12,
      fontWeight: '500'
    },
    selectedRoleButtonText: {
      color: 'white'
    },
    buttonContainer: {
      width: '100%',
      marginTop: 10
    }
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* Role Selection */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, selectedRole === 'customer' && styles.selectedRoleButton]}
          onPress={() => setSelectedRole('customer')}
        >
          <Text style={[styles.roleButtonText, selectedRole === 'customer' && styles.selectedRoleButtonText]}>
            Customer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, selectedRole === 'mechanic' && styles.selectedRoleButton]}
          onPress={() => setSelectedRole('mechanic')}
        >
          <Text style={[styles.roleButtonText, selectedRole === 'mechanic' && styles.selectedRoleButtonText]}>
            Mechanic
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, selectedRole === 'admin' && styles.selectedRoleButton]}
          onPress={() => setSelectedRole('admin')}
        >
          <Text style={[styles.roleButtonText, selectedRole === 'admin' && styles.selectedRoleButtonText]}>
            Admin
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <TextInput
        placeholder='Username'
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder='Email'
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {renderRoleSpecificFields()}

      <TextInput
        placeholder='Password'
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder='Confirm Password'
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? "Creating Account..." : "Create Account"}
          onPress={validateAndSubmit}
          disabled={isLoading}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Back to Welcome"
          onPress={() => router.push("/")}
        />
      </View>
    </ScrollView>
  );
}
