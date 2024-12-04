import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../../../firebaseConfig';
import { collection, addDoc, setDoc, doc, getDocs } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const CreateDoctor = ({ navigation }) => {
  const [doctorName, setDoctorName] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const specialtiesSnapshot = await getDocs(collection(firestore, 'specialties'));
        const specialtiesList = specialtiesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setSpecialties(specialtiesList);
      } catch (error) {
        console.error('Error fetching specialties:', error);
        Alert.alert('Error', 'Error fetching specialties!');
      }
    };
    
    fetchSpecialties();
  }, []);

  const handleCreateDoctor = async () => {
    try {
      // Validate that both doctorName and doctorSpecialty are provided
      if (!doctorName || !doctorSpecialty) {
        Alert.alert('Error', 'Please provide both name and specialty.');
        return;
      }
  
      // Generate a default email for the doctor
      const email = `${doctorName.toLowerCase().replace(/\s+/g, '')}@clinic.com`;
      const password = 'defaultPassword';  // Default password for the doctor
  
      // Create the doctor user in Firebase Authentication, but do not log them in automatically
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Create the user document in Firestore without changing their role
      await setDoc(doc(firestore, 'users', user.uid), {
        name: doctorName,
        email,
        role: 'doctor',
        // DO NOT set the role as 'doctor' here, so it stays as default (admin can set roles later)
      });
  
      // Get the specialty name from the specialties list based on the selected specialty ID
      const selectedSpecialty = specialties.find(specialty => specialty.id === doctorSpecialty);
      const specialtyName = selectedSpecialty ? selectedSpecialty.name : '';
  
      // Create a doctor record in the doctors collection
      await addDoc(collection(firestore, 'doctors'), {
        name: doctorName,
        specialty: specialtyName, // Store the specialty name
        specialtyId: doctorSpecialty, // Store the specialty ID
        createdAt: new Date(),
        userId: user.uid, // Link the doctor's record to the user by userId
      });
  
      // Reset the form fields for the next entry
      setDoctorName('');
      setDoctorSpecialty('');
  
      // Show a success alert
      Alert.alert('Success', 'Doctor created successfully!');
  
      // Ensure the admin's session is not lost and return to the appropriate screen (Dashboard)
      navigation.navigate('Dashboard');
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
      <Picker
        selectedValue={doctorSpecialty}
        style={styles.picker}
        onValueChange={(itemValue) => setDoctorSpecialty(itemValue)}
      >
        <Picker.Item label="Select Specialty" value="" />
        {specialties.map((specialty, index) => (
          <Picker.Item
            key={index}
            label={specialty.name}
            value={specialty.id} // Store the specialty id
          />
        ))}
      </Picker>
      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateDoctor}
      >
        <Text style={styles.buttonText}>Create Doctor</Text>
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
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
  picker: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    width: '60%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateDoctor;
