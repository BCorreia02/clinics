import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../../firebaseConfig';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

const CreateDoctor = ({ navigation }) => {
  const [doctorName, setDoctorName] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');

  const handleCreateDoctor = async () => {
    try {
      if (!doctorName || !doctorSpecialty) {
        Alert.alert('Error', 'Please provide both name and specialty.');
        return;
      }

      const email = `${doctorName.toLowerCase().replace(/\s+/g, '')}@clinic.com`;
      const password = 'defaultPassword';

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(firestore, 'users', user.uid), {
        name: doctorName,
        email,
        role: 'doctor',
      });

      await addDoc(collection(firestore, 'doctors'), {
        name: doctorName,
        specialty: doctorSpecialty,
        createdAt: new Date(),
        userId: user.uid,
      });

      Alert.alert('Success', 'Doctor created successfully!');
      setDoctorName('');
      setDoctorSpecialty('');
      navigation.goBack(); // Return to the previous screen
    } catch (error) {
      console.error('Error creating doctor:', error);
      Alert.alert('Error', 'Error creating doctor!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create New Doctor</Text>
      <TextInput
        style={styles.input}
        value={doctorName}
        placeholder="Doctor's Name"
        onChangeText={setDoctorName}
      />
      <TextInput
        style={styles.input}
        value={doctorSpecialty}
        placeholder="Doctor's Specialty"
        onChangeText={setDoctorSpecialty}
      />
      <Button title="Create Doctor" onPress={handleCreateDoctor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
});

export default CreateDoctor;
