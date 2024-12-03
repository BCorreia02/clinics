import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import { firestore } from '../../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import AvailabilityManagement from './AvailabilityMagament'; // Importing AvailabilityManagement component
import CreateAvailability from './CreateAvailability'; // Importing CreateAvailability component

const AvailabilityDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'doctors'));
        const doctorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(doctorsList);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, [refresh]); // Refresh the list when there's a change

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Availability Dashboard</Text>

      {/* Doctor Selection */}
      <Text>Select a Doctor:</Text>
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedDoctor(item)}
            style={{
              padding: 10,
              backgroundColor: selectedDoctor?.id === item.id ? '#00f' : '#ddd',
              marginVertical: 5,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: selectedDoctor?.id === item.id ? '#fff' : '#000' }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Availability Management and Creation */}
      {selectedDoctor && (
        <>
          <AvailabilityManagement selectedDoctor={selectedDoctor} refresh={refresh} setRefresh={setRefresh} />
          <CreateAvailability doctors={doctors} setRefresh={setRefresh} />
        </>
      )}
    </View>
  );
};

export default AvailabilityDashboard;
