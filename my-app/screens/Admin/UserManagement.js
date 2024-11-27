import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const UserManagement = ({ navigation }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.log('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Management</Text>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text>{item.name}</Text>
            <Text>{item.email}</Text>
            <Text>{item.role}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <Button
        title="Add New User"
        onPress={() => navigation.navigate('AdminPortal')} // Navigate to AdminPortal
      />
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
  },
  userCard: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default UserManagement;
