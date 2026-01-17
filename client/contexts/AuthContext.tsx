import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface User {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'customer' | 'mechanic';
    status: 'pending' | 'approved' | 'banned';
    createdAt: string;
    updatedAt: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string; }>;
    register: (userData: RegisterData) => Promise<{ success: boolean; message: string; }>;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'customer' | 'mechanic';
    [key: string]: any; // For role-specific data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:5001/api';

export const AuthProvider: React.FC<{ children: ReactNode; }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check if user is authenticated on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Navigate based on user role when user changes
    useEffect(() => {
        if (user && !isLoading) {
            navigateToRoleHome();
        }
    }, [user, isLoading]);

    const navigateToRoleHome = () => {
        if (!user) return;

        switch (user.role) {
            case 'admin':
                router.replace('/admin/home');
                break;
            case 'mechanic':
                router.replace('/mechanic/home');
                break;
            case 'customer':
                router.replace('/customer/home');
                break;
            default:
                router.replace('/');
        }
    };

    const checkAuthStatus = async () => {
        try {
            setIsLoading(true);
            const storedToken = await AsyncStorage.getItem('authToken');

            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            // Verify token with server
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setToken(storedToken);
            } else {
                // Token is invalid, clear storage
                await AsyncStorage.removeItem('authToken');
                setToken(null);
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            await AsyncStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; message: string; }> => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data
                await AsyncStorage.setItem('authToken', data.token);
                setToken(data.token);
                setUser(data.user);

                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const register = async (userData: RegisterData): Promise<{ success: boolean; message: string; }> => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data
                await AsyncStorage.setItem('authToken', data.token);
                setToken(data.token);
                setUser(data.user);

                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.error || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const logout = async () => {
        try {
            // Call logout endpoint if token exists
            if (token) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage regardless of server response
            await AsyncStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
            router.replace('/');
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        checkAuthStatus,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
