import React, {useState} from "react";
import { View, Text, StyleSheet, TextInput, FlatList, Button } from "react-native";

const mockMechanics = [
  {id: "1", name:"John's Auto Shop", location: "Austin, TX"},
  {id: "2", name:"Mary's Garage", location: "Dallas, TX"},
  {id: "3", name:"Speedy Repairs", location: "Houston, TX"},
]

export default function SearchScreen() {
  const [search, setSearch] = useState("")

  // Convert search input to lowercase once 
  const normalizedSearch = search.toLowerCase()

  // Filter mechanics by name or location 
  const filteredMechanics = mockMechanics.filter((mechanic) => {
    const mechanicName = mechanic.name.toLowerCase()
    const mechanicLocation = mechanic.location.toLowerCase()

    // Return true if either name or location includes the search string
    return mechanicName.includes(normalizedSearch) || mechanicLocation.includes(normalizedSearch)
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Mechanics</Text>
      <TextInput 
      style={styles.input}
      placeholder="Search by name or location"
      value = {search}
      onChangeText= {setSearch}
      />
      <FlatList
        data = {filteredMechanics}
        keyExtractor = {(item) => item.id}
        renderItem = {({ item }) => (
          <View style={styles.card}>
            <Text style={styles.mechanicName}>{item.name}</Text>
            <Text>{item.location}</Text>
            <Button title="View Details" onPress={() => {}}/>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20},
  title: { fontSize: 24, fontWeight: "bold", marginBottom:10 },
  input: {
    borderWidth:1,
    borderColor: "#ccc", 
    borderRadius: 8,
    padding:10, 
    marginBottom: 20
  }, 
  card:{
    padding: 15,
    borderWidth:1 , 
    borderColor: "#ddd",
    borderRadius: 8, 
    marginBottom: 15, 
  },
  mechanicName: {fontSize:18, fontWeight: "bold"}
});
