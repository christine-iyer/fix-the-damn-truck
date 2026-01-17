// client/helpers/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://localhost:5001/api"; 

export const vehicleProfile = async (vehicleData: any) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        return { success: false, message: "Not authenticated" };
      }

      const res = await fetch(`${API_URL}/vehicles`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(vehicleData)
      });
  
      const data = await res.json();
  
      if (res.ok) {
        return { success: true, data, message: "Vehicle created successfully" };
      } else {
        return { success: false, message: data.error || data.message || "Failed to create vehicle" };
      }
  
    } catch (error: any) {
      return { success: false, message: error.message || "Network error" };
    }
  };
  