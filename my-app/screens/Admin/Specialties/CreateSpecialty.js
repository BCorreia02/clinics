import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { firestore } from '../../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const CreateSpecialtyScreen = ({ navigation }) => {
  const [specialtyName, setSpecialtyName] = useState('');

  // Function to create a new specialty
  const createSpecialty = async () => {
    if (!specialtyName) {
      Alert.alert('Error', 'Please enter a specialty name');
      return;
    }

    try {
      await addDoc(collection(firestore, 'specialties'), {
        name: specialtyName,
      });
      Alert.alert('Success', 'Specialty created successfully');
      setSpecialtyName('');
      navigation.navigate('ServiceManagement');
    } catch (error) {
      Alert.alert('Error', 'Failed to create specialty');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Specialty</Text>

      <TextInput
        style={styles.input}
        value={specialtyName}
        onChangeText={setSpecialtyName}
        placeholder="Enter specialty name"
      />

      <TouchableOpacity style={styles.button} onPress={createSpecialty}>
        <Text style={styles.buttonText}>Create Specialty</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
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
    fontSize: 16,
  },
});

export default CreateSpecialtyScreen;
