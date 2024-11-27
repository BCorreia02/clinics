import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const PatientList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'patients'));
        const patientsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPatients(patientsList);
      } catch (error) {
        console.log('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Patient List</Text>
      <FlatList
        data={patients}
        renderItem={({ item }) => (
          <View style={styles.patientCard}>
            <Text>{item.name}</Text>
            <Text>{item.contact}</Text>
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
  patientCard: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default PatientList;
