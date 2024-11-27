import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust import based on your config

const HomeDoctor = ({ navigation }) => {
  const [doctorAppointments, setDoctorAppointments] = useState([]);

  // Fetch doctor's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'appointments'));
        const appointmentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctorAppointments(appointmentsList);
      } catch (error) {
        console.log('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Doctor Dashboard</Text>

      <FlatList
        data={doctorAppointments}
        renderItem={({ item }) => (
          <View style={styles.appointmentCard}>
            <Text>{item.patientName}</Text>
            <Text>{item.date}</Text>
            <Text>{item.time}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
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
  appointmentCard: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default HomeDoctor;
