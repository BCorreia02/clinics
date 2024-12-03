import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Button } from 'react-native';
import { firestore } from '../../../firebaseConfig';
import { collection, addDoc, doc, getDocs, getDoc } from 'firebase/firestore';

const AddScreen = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'services'));
        const servicesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesList);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching services:', error);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch doctors based on selected service
  const fetchDoctors = async (serviceId) => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, `services/${serviceId}/doctors`));
      const doctorsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctorsList);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching doctors:', error);
      setLoading(false);
    }
  };

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
        service_id: selectedService.id,
        service_name: selectedService.name,
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
      setSelectedService(null); // Reset the selection process
      setSelectedDoctor(null);
      setAvailableSlots([]);
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Book an Appointment</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          {!selectedService && (
            <>
              <Text style={{ marginBottom: 10 }}>Select a Service:</Text>
              <FlatList
                data={services}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedService(item);
                      fetchDoctors(item.id);
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
            </>
          )}

          {selectedService && !selectedDoctor && (
            <>
              <Text style={{ marginBottom: 10 }}>Select a Doctor for {selectedService.name}:</Text>
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
            </>
          )}

          {selectedDoctor && (
            <>
              <Text style={{ marginBottom: 10 }}>Available Slots for {selectedDoctor.name}:</Text>
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setAppointmentTime(slot)}
                    style={{
                      padding: 10,
                      backgroundColor: appointmentTime === slot ? '#00f' : '#eee',
                      marginVertical: 5,
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: appointmentTime === slot ? '#fff' : '#000' }}>{slot}</Text>
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
