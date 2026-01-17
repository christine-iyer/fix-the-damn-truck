//forgot-password
import {useRouter } from 'expo-router'; 
import React from 'react'; 
import {Button, StyleSheet, Text, TextInput , View} from 'react-native'

export default function ForgotPassword(){
    const router = useRouter()

    return(
        <View style={styles.container}>
            <Text>Forgot Password</Text>
            <TextInput placeholder="Email" style={styles.input} />
            <Button
                title = 'Back to Login'
                onPress={() =>  router.back()}
                />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '80%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  });
  