// client/app/index.tsx (root entry)
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Button, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  // If user is already authenticated, they'll be redirected by AuthContext
  // This screen should only show for unauthenticated users

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user is authenticated, show a brief message before redirect
  if (user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Welcome back, {user.username}!</Text>
        <Text style={styles.subtitle}>Redirecting to your dashboard...</Text>
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AutoApp</Text>
      <Text style={styles.subtitle}>Your trusted automotive service platform</Text>

      <View style={styles.buttonContainer}>
        <Button
          title='Login'
          onPress={() => router.push("/auth/login")}
        />
        <Button
          title="Sign Up"
          onPress={() => router.push('/auth/signup')}
        />
      </View>
    </View>


  )

}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  buttonContainer: {
    width: '100%',
    gap: 10
  }
});
