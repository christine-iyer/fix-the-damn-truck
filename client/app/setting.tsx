import React from "react";
import {View , Text, TouchableOpacity, Alert, StyleSheet , Platform} from "react-native"; 
import {useAuth} from "../contexts/AuthContext"; // where the api to the backend lives
import {useRouter} from "expo-router"; 

export default function SettingScreen() {
    const router = useRouter()
    
    const { user , logout} = useAuth(); 

    const showAlert = (title: string, message: string) => {
        if (Platform.OS === "web") 
            {
                window.alert(`${title}: ${message}`)
            } else {
                showAlert(title, message);
      };
    }

    const handleLogout = async () => {
        try {
            await logout(); // calls your context's logout logic 
            router.replace("/auth/login") // sends the user back to your login page and removes current route from history so they can't go back to protected screens 
        } catch (error: any) { 
            showAlert("Logout Failed", error.message || "Somthing went wrong.")
        }
      };


    return(
        <View>
            <TouchableOpacity onPress={handleLogout}> 
                <Text>Logout</Text>
            </TouchableOpacity>
        </View>
    )


}