import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { firestore } from '../../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ServiceManagementScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);

  // Fetch services from Firestore
  useEffect(() => {
    const fetchServices = async () => {
      const serviceSnapshot = await getDocs(collection(firestore, 'services'));
      const serviceList = serviceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(serviceList);
    };

    fetchServices();
  }, []);

  // Function to delete a service
  const deleteService = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'services', id));
      setServices(services.filter(service => service.id !== id));
      Alert.alert('Success', 'Service deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete service');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Service Management</Text>
      {/* List of Services */}
      {services.map(service => (
        <View key={service.id} style={styles.serviceContainer}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceInfo}>Assigned Doctor: {service.doctor}</Text>

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
      ))}

      <TouchableOpacity 
        style={[styles.button, styles.createButton]} 
        onPress={() => navigation.navigate('CreateService')}>
        <Text style={styles.buttonText}>Create Service</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  serviceContainer: {
    marginBottom: 20,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#4CAF50', // Green for edit
  },
  deleteButton: {
    backgroundColor: '#F44336', // Red for delete
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#2196F3', // Blue for create service
  }
});

export default ServiceManagementScreen;
