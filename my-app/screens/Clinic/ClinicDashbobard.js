import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const ClinicDashboard = () => {
  const [clinicStats, setClinicStats] = useState({ appointments: 0, activePatients: 0 });

  useEffect(() => {
    const fetchClinicStats = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'appointments'));
        const appointments = querySnapshot.size; // Example: get the number of appointments
        const activePatients = appointments; // This can be modified for actual active patients logic
        setClinicStats({ appointments, activePatients });
      } catch (error) {
        console.log('Error fetching clinic stats:', error);
      }
    };

    fetchClinicStats();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Clinic Dashboard</Text>
      <Text>Total Appointments: {clinicStats.appointments}</Text>
      <Text>Active Patients: {clinicStats.activePatients}</Text>
      <Button title="Manage Appointments" onPress={() => {/* Navigate to appointment management */}} />
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
});

export default ClinicDashboard;
