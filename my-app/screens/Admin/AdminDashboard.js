import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { auth, firestore } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const AdminDashboard = ({ navigation , handleLogout }) => {

  const [clinicData, setClinicData] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const querySnapshot = await getDocs(collection(firestore, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
      } catch (error) {
        console.log('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch Clinic Data
  useEffect(() => {
    const fetchClinicData = async () => {
      setLoadingClinics(true);
      try {
        const querySnapshot = await getDocs(collection(firestore, 'clinics'));
        const data = querySnapshot.docs.map(doc => doc.data());
        setClinicData(data);
      } catch (error) {
        console.log('Error fetching clinic data:', error);
      } finally {
        setLoadingClinics(false);
      }
    };

    fetchClinicData();
  }, []);

   // Function to update appointment status
   const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await firestore.collection('appointments').doc(appointmentId).update({
        status: newStatus,
      });
      // Refresh appointments after updating
      setAppointments(prevAppointments =>
        prevAppointments.map(app =>
          app.id === appointmentId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      <Text style={styles.subHeader}>Clinic Data</Text>
      {loadingClinics ? (
        <ActivityIndicator size="large" color="#00bcd4" />
      ) : clinicData.length > 0 ? (
        <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text>Doctor: {item.doctor_name}</Text>
            <Text>Client: {item.client_name}</Text>
            <Text>Date: {item.date} | Time: {item.time}</Text>
            <Text>Status: {item.status}</Text>
            <Button
              title="Confirm"
              onPress={() => updateAppointmentStatus(item.id, 'confirmed')}
            />
            <Button
              title="Cancel"
              onPress={() => updateAppointmentStatus(item.id, 'cancelled')}
            />
          </View>
        )}
      />
      ) : (
        <Text>No clinic data available</Text>
      )}


      <View style={styles.buttonContainer}>
        <Button title="Create Doctor" onPress={() => navigation.navigate('CreateDoctor')} />
        <Button title="Add New User" onPress={() => navigation.navigate('AdminPortal')} />
        <Button title="Go to Settings" onPress={() => navigation.navigate('Settings')} />
        <Button title="Logout" onPress={() => handleLogout(navigation)} />
      </View>
    </View>
  );
};

// Estilos aprimorados
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
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#e0f7fa',
    borderColor: '#00bcd4',
  },
  userCard: {
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fce4ec',
    borderColor: '#f48fb1',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});

export default AdminDashboard;
