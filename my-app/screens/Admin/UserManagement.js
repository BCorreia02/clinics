import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { doc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

const UserManagement = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Split users into doctors and clients
        const doctorsList = usersList.filter(user => user.role === 'doctor');
        const clientsList = usersList.filter(user => user.role === 'client');
        
        setDoctors(doctorsList);
        setClients(clientsList);
      } catch (error) {
        console.log('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Handle removing a user
  const removeUser = async (userId) => {
    try {
      await deleteDoc(doc(firestore, 'users', userId));
      setDoctors(doctors.filter(user => user.id !== userId));
      setClients(clients.filter(user => user.id !== userId));
      Alert.alert('Success', 'User removed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove user');
      console.error(error);
    }
  };

  // Render user cards
  const renderUserCard = (item, role) => (
    <View style={styles.userCard} key={item.id}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text>{item.email}</Text>
      <Text>{item.role}</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.editButton]} 
          onPress={() => navigation.navigate('EditUser', { userId: item.id, role })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.removeButton]} 
          onPress={() => removeUser(item.id)}
        >
          <Text style={[styles.buttonText, styles.removeButtonText]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Management</Text>

      {/* Doctors Section */}
      <Text style={styles.sectionHeader}>Doctors</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {doctors.map((doctor) => renderUserCard(doctor, 'doctor'))}
      </ScrollView>

      {/* Clients Section */}
      <Text style={styles.sectionHeader}>Clients</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {clients.map((client) => renderUserCard(client, 'client'))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, styles.addButton]}
        onPress={() => navigation.navigate('AdminPortal')} // Navigate to AdminPortal
      >
        <Text style={styles.buttonText}>Add New User</Text>
      </TouchableOpacity>
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
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollView: {
    marginBottom: 20,
  },
  userCard: {
    marginRight: 15,
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
    width: 200,
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#4CAF50', // Green for edit
  },
  removeButton: {
    backgroundColor: '#F44336', // Red for remove
  },
  removeButtonText: {
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2196F3', // Blue for add new user
    marginTop: 20,
  },
});

export default UserManagement;
