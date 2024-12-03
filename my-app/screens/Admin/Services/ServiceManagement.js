import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { firestore } from '../../../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ServiceManagementScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  // Fetch services from Firestore
  const fetchServices = async () => {
    const serviceSnapshot = await getDocs(collection(firestore, 'services'));
    const serviceList = serviceSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setServices(serviceList);
  };

  // Fetch specialties from Firestore
  const fetchSpecialties = async () => {
    const specialtySnapshot = await getDocs(collection(firestore, 'specialties'));
    const specialtyList = specialtySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setSpecialties(specialtyList);
  };

  useEffect(() => {
    fetchServices(); // Initially load the services
    fetchSpecialties(); // Initially load the specialties
  }, []);

  // Function to delete a service
  const deleteService = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'services', id));  // Delete service from Firestore
      Alert.alert('Success', 'Service deleted successfully');
      fetchServices();  // Refetch services after deletion to keep the list updated
    } catch (error) {
      Alert.alert('Error', 'Failed to delete service');
      console.error(error);
    }
  };

  // Function to delete a specialty
  const deleteSpecialty = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'specialties', id));  // Delete specialty from Firestore
      Alert.alert('Success', 'Specialty deleted successfully');
      fetchSpecialties();  // Refetch specialties after deletion to keep the list updated
    } catch (error) {
      Alert.alert('Error', 'Failed to delete specialty');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Service Management</Text>
      
      {/* Horizontal ScrollView for Services */}
      <ScrollView horizontal={true} style={styles.horizontalScrollContainer}>
        {services.map(service => (
          <View key={service.id} style={styles.serviceContainer}>
            <Text style={styles.serviceName}>{service.name}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.editButton]} 
                onPress={() => navigation.navigate('EditService', { serviceId: service.id })}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.deleteButton]} 
                onPress={() => deleteService(service.id)}>
                <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.title}>Specialty Management</Text>
      
      {/* Horizontal ScrollView for Specialties */}
      <ScrollView horizontal={true} style={styles.horizontalScrollContainer}>
        {specialties.map(specialty => (
          <View key={specialty.id} style={styles.serviceContainer}>
            <Text style={styles.serviceName}>{specialty.name}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.editButton]} 
                onPress={() => navigation.navigate('EditSpecialty', { specialtyId: specialty.id })}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.deleteButton]} 
                onPress={() => deleteSpecialty(specialty.id)}>
                <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Buttons side by side at the bottom */}
      <View style={styles.createButtonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.createButton, styles.createSideBySide]} 
          onPress={() => navigation.navigate('CreateService')}>
          <Text style={styles.buttonText}>Create Service</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.createButton, styles.createSideBySide]} 
          onPress={() => navigation.navigate('CreateSpecialty')}>
          <Text style={styles.buttonText}>Create Specialty</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  serviceContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'flex-start',
    marginRight: 10, // Adds space between items in horizontal scroll
    width: 200, // Controls width of each item in the horizontal scroll
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  serviceInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
  },
  editButton: {
    backgroundColor: '#000',
  },
  deleteButton: {
    backgroundColor: '#000',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'normal',
  },
  horizontalScrollContainer: {
    marginBottom: 20,
  },
  createButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
  },
  createSideBySide: {
    marginHorizontal: 5,
  },
});

export default ServiceManagementScreen;
