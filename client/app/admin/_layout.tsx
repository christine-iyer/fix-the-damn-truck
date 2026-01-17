// example: app/auth/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="home" options={{ title: "Home" }} />
      <Stack.Screen name="verify" options={{ title: "Verify" }} />
    </Stack>
  );
}
