// client/app/customer/_layout.tsx
// define how the user move between all those pages
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="home" options={{title: "Home"}} /> 
      <Stack.Screen name="booking" options={{ title: "Booking" }} />
      <Stack.Screen name="confirmation" options={{ title: "Confirmation" }} />
      <Stack.Screen name="vehiceProfile" options={{ title: "Vehcile Profile" }} />
      <Stack.Screen name="search" options={{ title: "Search Services" }} />
    </Stack>
  );
}
