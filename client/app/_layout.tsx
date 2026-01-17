import { Tabs } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
    return (
        <AuthProvider>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#007AFF',
                    tabBarInactiveTintColor: '#8E8E93',
                    tabBarStyle: {
                        backgroundColor: '#FFFFFF',
                        borderTopWidth: 1,
                        borderTopColor: '#E5E5EA',
                        paddingBottom: 5,
                        paddingTop: 5,
                        height: 60,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Welcome',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="home-outline" size={size} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </AuthProvider>
    );
}