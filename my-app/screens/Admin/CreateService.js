import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { Menu, Provider } from 'react-native-paper';

const CreateServiceScreen = ({ navigation }) => {
  const [serviceName, setServiceName] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]); // Store specialty names
  const [specialties, setSpecialties] = useState([]);
  const [specialtyMenuVisible, setSpecialtyMenuVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const specialtiesSnapshot = await getDocs(collection(firestore, 'specialties'));
      const specialtiesList = specialtiesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setSpecialties(specialtiesList);
    };

    fetchData();
  }, []);

  const toggleSpecialtySelection = (specialtyId, specialtyName) => {
    setSelectedSpecialties((prevSelectedSpecialties) => {
      if (prevSelectedSpecialties.includes(specialtyId)) {
        return prevSelectedSpecialties.filter((id) => id !== specialtyId);
      } else {
        return [...prevSelectedSpecialties, specialtyId];
      }
    });
  };

  const createService = async () => {
    if (!serviceName || selectedSpecialties.length === 0) {
      Alert.alert('Error', 'Please provide service name and select at least one specialty');
      return;
    }

    try {
      await addDoc(collection(firestore, 'services'), {
        name: serviceName,
        specialties: selectedSpecialties,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Service created successfully');
      setServiceName('');
      setSelectedSpecialties([]);
      navigation.navigate('ServiceManagement');
    } catch (error) {
      Alert.alert('Error', 'Failed to create service');
      console.error(error);
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.header}>Create New Service</Text>

        <TextInput
          style={styles.input}
          value={serviceName}
          placeholder="Service Name"
          onChangeText={setServiceName}
        />

        {/* Specialty selection menu */}
        <Menu
          visible={specialtyMenuVisible}
          onDismiss={() => setSpecialtyMenuVisible(false)}
          anchor={
            <TouchableOpacity style={styles.button} onPress={() => setSpecialtyMenuVisible(true)}>
              <Text style={styles.buttonText}>
                {selectedSpecialties.length > 0
                  ? specialties.filter(specialty => selectedSpecialties.includes(specialty.id))
                      .map(specialty => specialty.name).join(', ')
                  : 'Select Specialties'}
              </Text>
            </TouchableOpacity>
          }
        >
          {specialties.map((specialty) => (
            <Menu.Item
              key={specialty.id}
              title={specialty.name}
              onPress={() => toggleSpecialtySelection(specialty.id, specialty.name)}
              style={styles.menuItem}
            />
          ))}
        </Menu>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={createService}>
            <Text style={styles.buttonText}>Create Service</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Provider>
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
    marginBottom: 20, // Spacing between input and menu buttons
  },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%', // Ensure buttons take the full width
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  menuItem: {
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1, // Ensure buttons have equal width
    marginRight: 10, // Spacing between buttons
  },
  actionButtonLast: {
    marginRight: 0, // Remove margin for the last button
  },
});

export default CreateServiceScreen;
