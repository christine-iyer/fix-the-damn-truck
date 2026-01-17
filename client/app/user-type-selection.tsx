 // user-type-selection
 import {useRouter} from "expo-router"; 
 import React from "react"; 
 import {Button , StyleSheet , Text, TextInput, View } from "react-native"; 

 export default function UserTypeSelection(){

    const router = useRouter()
    return (
        <View>
            <Text>Select User Type</Text>
            <Button 
                title = "Admin"
                onPress={() => router.push('/admin/home')} 
            />
            <Button 
                title = "Mechanic"
                onPress={() => router.push('/mechanic/home')} 
            />
            <Button 
                title = "Customer"
                onPress={() => router.push('/customer/home')} 
            />
        </View>
    )
 }