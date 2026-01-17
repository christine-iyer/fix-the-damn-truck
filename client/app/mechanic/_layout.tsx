// example: app/auth/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="confirmation" options={{ title: "Confirmation" }} />
      <Stack.Screen name="home" options={{ title: "Home" }} />
      <Stack.Screen name="queue" options={{ title: "Queue" }} />
      <Stack.Screen name="upload" options={{ title: "Upload" }} />
      <Stack.Screen name='profile' options={{ title: "Profile" }} />
       <Stack.Screen name="appointments" options={{ title: "Appointments" }} />
    </Stack>
  );
}