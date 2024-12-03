import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { firestore } from '../../../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ServiceManagementScreen = ({ navigation }) => {
  const [specialties, setSpecialties] = useState([]);

  // Fetch specialties with their related services
  const fetchSpecialtiesWithServices = async () => {
    try {
      // Fetch specialties
      const specialtySnapshot = await getDocs(collection(firestore, 'specialties'));
      const specialtyList = specialtySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        services: [], // Initialize services array
      }));

      // Fetch services
      const serviceSnapshot = await getDocs(collection(firestore, 'services'));
      const serviceList = serviceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Link services to their respective specialties
      const specialtiesWithServices = specialtyList.map(specialty => ({
        ...specialty,
        services: serviceList.filter(service => service.specialtyId === specialty.id),
      }));

      setSpecialties(specialtiesWithServices);
    } catch (error) {
      console.error('Error fetching specialties or services:', error);
    }
  };

  useEffect(() => {
    // Listener para recarregar dados ao retornar para a tela
    const unsubscribe = navigation.addListener('focus', fetchSpecialtiesWithServices);
  
    // Limpar o listener ao desmontar o componente
    return unsubscribe;
  }, [navigation]);
  // Function to delete a specialty
  const deleteSpecialty = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'specialties', id));
      Alert.alert('Success', 'Specialty deleted successfully');
      fetchSpecialtiesWithServices(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to delete specialty');
      console.error(error);
    }
  };

  // Function to delete a service
  const deleteService = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'services', id));
      Alert.alert('Success', 'Service deleted successfully');
      fetchSpecialtiesWithServices(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to delete service');
      console.error(error);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContent} 
      style={styles.scrollView}>

    {specialties.map(specialty => (
      <View key={specialty.id} style={styles.specialtyContainer}>
        <Text style={styles.specialtyName}>{specialty.name}</Text>

        {/* List of services within this specialty */}
        {specialty.services.length > 0 ? (
          specialty.services.map(service => (
            <View key={service.id} style={styles.serviceContainer}>
              <Text style={styles.serviceName}>{service.name}</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => navigation.navigate('EditService', { serviceId: service.id })}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => deleteService(service.id)}
                >
                  <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noServiceText}>No services available</Text>
        )}

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => deleteSpecialty(specialty.id)}
        >
          <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete Specialty</Text>
        </TouchableOpacity>
      </View>
    ))}

    {/* Buttons to create specialties and services */}
    <View style={styles.createButtonsContainer}>
      <TouchableOpacity
        style={[styles.button, styles.createButton]}
        onPress={() => navigation.navigate('CreateSpecialty')}
      >
        <Text style={styles.buttonText}>Create Specialty</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.createButton]}
        onPress={() => navigation.navigate('CreateService')}
      >
        <Text style={styles.buttonText}>Create Service</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>

  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
    paddingHorizontal: 10, // Add horizontal padding
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff', // Softer background color
  },
  specialtyContainer: {
    width: '90%', // Reduce card width
    alignSelf: 'center', // Center the cards
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  specialtyName: {
    fontSize: 18,
    fontWeight: 'normal',
    marginBottom: 10,
    color: '#000', // Darker text for better contrast
  },
  serviceContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#000', // Unified black buttons
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  noServiceText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  createButtonsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  createButton: {
    backgroundColor: '#000', // Unified black buttons
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    width: '45%', // Adjust width for side-by-side layout
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
});


export default ServiceManagementScreen;
