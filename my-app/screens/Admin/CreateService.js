import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TextInput, Menu, Provider } from 'react-native-paper';
import { firestore } from '../../firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const CreateServiceScreen = ( { navigation } ) => {
  const [serviceName, setServiceName] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState([]); // Store doctor IDs
  const [doctors, setDoctors] = useState([]);
  const [doctorMenuVisible, setDoctorMenuVisible] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorSnapshot = await getDocs(collection(firestore, 'doctors'));
      const doctorList = doctorSnapshot.docs.map(doc => ({
        id: doc.id,  // Store doctor ID
        ...doc.data(),
      }));
      setDoctors(doctorList);
    };

    fetchDoctors();
  }, []);

  const toggleDoctorSelection = (doctorId, doctorName) => {
    setSelectedDoctors((prevSelectedDoctors) => {
      if (prevSelectedDoctors.includes(doctorId)) {
        return prevSelectedDoctors.filter((id) => id !== doctorId);  // Remove by ID
      } else {
        return [...prevSelectedDoctors, doctorId];  // Add by ID
      }
    });
  };

  const createService = async () => {
    if (!serviceName || selectedDoctors.length === 0) {
      Alert.alert('Error', 'Please provide both service name and at least one doctor');
      return;
    }

    try {
      await addDoc(collection(firestore, 'services'), {
        name: serviceName,
        doctors: selectedDoctors,  // Store doctor IDs
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Service created successfully');
      setServiceName('');
      setSelectedDoctors([]);  // Clear selected doctors
      navigation.navigate('ServiceManagement')
    } catch (error) {
      Alert.alert('Error', 'Failed to create service');
      console.error(error);
    }
  };

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Create Service</Text>

        <TextInput
          label="Service Name"
          value={serviceName}
          onChangeText={setServiceName}
          style={styles.textInput}
        />

        <Menu
          visible={doctorMenuVisible}
          onDismiss={() => setDoctorMenuVisible(false)}
          anchor={
            <TouchableOpacity style={styles.button} onPress={() => setDoctorMenuVisible(true)}>
              <Text style={styles.buttonText}>
                {selectedDoctors.length > 0
                  ? doctors.filter(doctor => selectedDoctors.includes(doctor.id)).map(doctor => doctor.name).join(', ')
                  : 'Select Doctors'}
              </Text>
            </TouchableOpacity>
          }
        >
          {doctors.map((doctor) => (
            <Menu.Item
              key={doctor.id}
              title={doctor.name}  // Display doctor name
              onPress={() => toggleDoctorSelection(doctor.id, doctor.name)}  // Pass doctor ID
              style={styles.menuItem}
            />
          ))}
        </Menu>

        <TouchableOpacity style={styles.createButton} onPress={createService}>
          <Text style={styles.createButtonText}>Create Service</Text>
        </TouchableOpacity>
      </ScrollView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  textInput: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
  },
  button: {
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  menuItem: {
    padding: 10,
    width: 20,
  },
  createButton: {
    marginTop: 20,
    backgroundColor: '#6200EE',
    borderRadius: 8,
    paddingVertical: 12,
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});

export default CreateServiceScreen;
