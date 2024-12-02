import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';

const NameScreen = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const { email } = route.params;

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }
    navigation.navigate('Password', { name, email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your name?</Text>
      <TextInput
        style={styles.input}
        value={name}
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff', // White background
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000', // Black text for the title
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#000', // Blue underline
    marginBottom: 40, // Spacing between input and button
  },
  button: {
    backgroundColor: '#000', // Blue button for the next action
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    width: '60%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default NameScreen;
