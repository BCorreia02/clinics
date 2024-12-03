import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { doc, getDocs, collection, deleteDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UserManagement = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const clientsSnapshot = await getDocs(collection(firestore, 'clients'));
      const clientsList = await Promise.all(
        clientsSnapshot.docs.map(async (docSnapshot) => {
          const clientData = docSnapshot.data();
          if (clientData) {
            const userId = clientData.userId;
            const userEmail = userId ? (await getDoc(doc(firestore, 'users', userId))).data()?.email : null;
            return { id: docSnapshot.id, ...clientData, email: userEmail || 'No email found' };
          }
          return { id: docSnapshot.id, email: 'No email found' };
        })
      );

      setClients(clientsList);

      const doctorsSnapshot = await getDocs(collection(firestore, 'doctors'));
      const doctorsList = await Promise.all(
        doctorsSnapshot.docs.map(async (docSnapshot) => {
          const doctorData = docSnapshot.data();
          const userId = doctorData.userId;
          const userEmail = userId ? (await getDoc(doc(firestore, 'users', userId))).data()?.email : null;
          const doctorspecialty = doctorData.specialty
          return { id: docSnapshot.id, ...doctorData, email: userEmail, specialty: doctorspecialty  || 'No email found' };
        })
      );

      setDoctors(doctorsList);

      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const usersList = usersSnapshot.docs.map((docSnapshot) => {
        const userData = docSnapshot.data();
        return { id: docSnapshot.id, ...userData, email: userData.email || 'No email found' };
      });

      setUsers(usersList);
    } catch (error) {
      console.log('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const removeUser = async (userId) => {
    try {
      await deleteDoc(doc(firestore, 'users', userId));
      setDoctors((prevDoctors) => prevDoctors.filter((user) => user.id !== userId));
      setClients((prevClients) => prevClients.filter((user) => user.id !== userId));
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      Alert.alert('Success', 'User removed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove user');
      console.error(error);
    }
  };

  const renderUserCard = (item, role) => (
    <View style={styles.userCard} key={item.id}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text>{item.email}</Text>
      {role === 'doctor' && item.specialty && (
        <Text style={styles.specialtyText}>{item.specialty}</Text>
      )}
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
  

  const renderSection = (sectionTitle, data, role) => (
    <View>
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeader}>{sectionTitle}</Text>
        {role === 'doctor' && (
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={() => navigation.navigate('CreateDoctor')}
        >
          <Icon name="add" size={10} color="#fff" />
        </TouchableOpacity>
      )}
      </View>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderUserCard(item, role)}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {renderSection('Doctors', doctors, 'doctor')}
      {renderSection('Clients', clients, 'client')}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userCard: {
    marginRight: 15,
    padding: 25,
    borderWidth: 1,
    borderRadius: 25,
    borderColor: '#000',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionButtons: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  editButton: {
    backgroundColor: '#000',
  },
  removeButton: {
    backgroundColor: '#000',
  },
  removeButtonText: {
    color: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#000',
    width: 40,
    height: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UserManagement;
