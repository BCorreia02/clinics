import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Button } from 'react-native';
import { firestore } from '../../firebaseConfig';
import { collection, addDoc, doc, getDocs, getDoc } from 'firebase/firestore';

const AddScreen = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch doctors when component mounts
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log(firestore);  // Debugging line
        const querySnapshot = await getDocs(collection(firestore, 'doctors'));
        const doctorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(doctorsList);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.log('Error fetching doctors:', error);
        setLoading(false); // Ensure loading is set to false even if there's an error
      }
    };
  
    fetchDoctors();
  }, []);

  // Fetch available slots for the selected doctor
  const fetchAvailableSlots = async (doctorId) => {
    try {
      const docRef = doc(firestore, 'availabilities', doctorId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setAvailableSlots(snapshot.data().slots || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  // Handle appointment booking
  const bookAppointment = async () => {
    if (!appointmentTime) {
      alert('Please select an appointment time!');
      return;
    }

    try {
      const newAppointment = {
        doctor_id: selectedDoctor.id,
        client_name: 'Client Name',
        doctor_name: selectedDoctor.name,
        date: new Date().toISOString(),
        time: appointmentTime,
        status: 'pending',
      };

      await addDoc(collection(firestore, 'appointments'), newAppointment);
      alert('Appointment booked successfully!');
      setAppointmentTime(''); // Reset appointment time after booking
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Book an Appointment</Text>
      {loading ? (
        <Text>Loading doctors...</Text>
      ) : (
        <>
          <FlatList
            data={doctors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedDoctor(item);
                  fetchAvailableSlots(item.id);
                }}
                style={{
                  padding: 10,
                  backgroundColor: '#ddd',
                  marginVertical: 5,
                  borderRadius: 5,
                }}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />

          {selectedDoctor && (
            <>
              <Text>Available Slots for {selectedDoctor.name}:</Text>
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setAppointmentTime(slot)}
                    style={{
                      padding: 10,
                      backgroundColor: '#eee',
                      marginVertical: 5,
                      borderRadius: 5,
                    }}
                  >
                    <Text>{slot}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text>No slots available</Text>
              )}
            </>
          )}

          {appointmentTime && (
            <Button title="Confirm Appointment" onPress={bookAppointment} />
          )}
        </>
      )}
    </View>
  );
};

export default AddScreen;
