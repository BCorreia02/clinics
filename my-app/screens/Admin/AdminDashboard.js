import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TextInput } from 'react-native';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust import based on your config
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebaseConfig';

const AdminDashboard = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [clinicData, setClinicData] = useState([]);
  const [doctorName, setDoctorName] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');

  // Fetch Users
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

  // Fetch Clinic Data
  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'clinics'));
        const data = querySnapshot.docs.map(doc => doc.data());
        setClinicData(data);
      } catch (error) {
        console.log('Error fetching clinic data:', error);
      }
    };

    fetchClinicData();
  }, []);

  // Handle User Creation
  const handleCreateUser = async (email, password, name, role) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(firestore, 'users', user.uid), {
        name,
        email,
        role,
      });

      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error.message);
      alert('Error creating user!');
    }
  };

  // Handle Doctor Creation
  const handleCreateDoctor = async () => {
    try {
      if (!doctorName || !doctorSpecialty) {
        alert('Please provide both name and specialty.');
        return;
      }

      // Add doctor to Firestore
      await addDoc(collection(db, 'doctors'), {
        name: doctorName,
        specialty: doctorSpecialty,
        createdAt: new Date(),
      });

      alert('Doctor created successfully!');
      setDoctorName('');
      setDoctorSpecialty('');
    } catch (error) {
      console.error('Error creating doctor:', error);
      alert('Error creating doctor!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      <Text style={styles.subHeader}>Clinic Data</Text>
      {clinicData.length > 0 ? (
        <FlatList
          data={clinicData}
          renderItem={({ item }) => (
            <View style={styles.clinicCard}>
              <Text>{item.name}</Text>
              <Text>{item.totalAppointments} Appointments</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <Text>No clinic data available</Text>
      )}

      <Text style={styles.subHeader}>User Management</Text>
      {users.length > 0 ? (
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
      ) : (
        <Text>No users found</Text>
      )}

      <Text style={styles.subHeader}>Create New Doctor</Text>
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

      <Button
        title="Add New User"
        onPress={() => navigation.navigate('AdminPortal')} // Navigate to user creation screen
      />
      <Button
        title="Go to Settings"
        onPress={() => navigation.navigate('Settings')} // Placeholder for Settings screen
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
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  clinicCard: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  userCard: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
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

export default AdminDashboard;
