import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Button } from 'react-native';
import { firestore } from '../../../firebaseConfig';
import { collection, addDoc, doc, getDocs, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';

const AddScreen = () => {
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'specialties'));
        const specialtiesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSpecialties(specialtiesList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching specialties:', error);
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  useEffect(() => {
    if (selectedSpecialty) {
      fetchServices(selectedSpecialty.id);
      // Reset lower-level state
      setSelectedService(null);
      setServices([]);
      setDoctors([]);
      setSelectedDoctor(null);
      setAvailableSlots([]);
      setAppointmentTime('');
    }
  }, [selectedSpecialty]);

  useEffect(() => {
    if (selectedService) {
      fetchDoctors(selectedSpecialty.id, selectedService.id);
      // Reset doctor and slot data
      setDoctors([]);
      setSelectedDoctor(null);
      setAvailableSlots([]);
      setAppointmentTime('');
    }
  }, [selectedService]);

  const fetchServices = async (specialtyId) => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'services'));
      const servicesList = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(service => service.specialtyId === specialtyId);
      setServices(servicesList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setLoading(false);
    }
  };

  const fetchDoctors = async (specialtyId, serviceId) => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'doctors'));
      const doctorsList = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(doctor => doctor.specialtyId === specialtyId);
      setDoctors(doctorsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (doctorId) => {
    try {
      const doctorRef = doc(firestore, 'doctors', doctorId);
      const doctorSnapshot = await getDoc(doctorRef);

      if (doctorSnapshot.exists()) {
        const allSlots = doctorSnapshot.data().availableSlots || [];

        const appointmentsSnapshot = await getDocs(collection(firestore, 'appointments'));
        const bookedSlots = appointmentsSnapshot.docs
          .filter(doc => doc.data().doctor_id === doctorId)
          .map(doc => doc.data().time);

        const freeSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
        setAvailableSlots(freeSlots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const bookAppointment = async () => {
    if (!appointmentTime) {
      alert('Please select an appointment time!');
      return;
    }

    try {
      const newAppointment = {
        specialty_id: selectedSpecialty.id,
        specialty_name: selectedSpecialty.name,
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
      setAppointmentTime('');
      setSelectedSpecialty(null);
      setSelectedService(null);
      setSelectedDoctor(null);
      setAvailableSlots([]);
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book an Appointment</Text>
        {(selectedSpecialty || selectedService || selectedDoctor) && (
          <TouchableOpacity
            onPress={() => {
              if (selectedDoctor) {
                setSelectedDoctor(null);
                setAvailableSlots([]);
                setAppointmentTime('');
              } else if (selectedService) {
                setSelectedService(null);
                setDoctors([]);
                setAvailableSlots([]);
                setAppointmentTime('');
              } else if (selectedSpecialty) {
                setSelectedSpecialty(null);
                setServices([]);
                setDoctors([]);
                setAvailableSlots([]);
                setAppointmentTime('');
              }
            }}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={20} color="black" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          {!selectedSpecialty && (
            <>
              <Text style={styles.sectionTitle}>Select a Specialty:</Text>
              <FlatList
                data={specialties}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedSpecialty(item)}
                    style={styles.item}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {selectedSpecialty && !selectedService && (
            <>
              <Text style={styles.sectionTitle}>Select a Service in {selectedSpecialty.name}:</Text>
              <FlatList
                data={services}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedService(item)}
                    style={styles.item}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {selectedService && !selectedDoctor && (
            <>
              <Text style={styles.sectionTitle}>Select a Doctor for {selectedService.name}:</Text>
              <FlatList
                data={doctors}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDoctor(item);
                      fetchAvailableSlots(item.id);
                    }}
                    style={styles.item}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {selectedDoctor && (
            <>
              <Text style={styles.sectionTitle}>Available Slots for {selectedDoctor.name}:</Text>
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setAppointmentTime(slot)}
                    style={[
                      styles.item,
                      appointmentTime === slot && styles.selectedItem,
                    ]}
                  >
                    <Text
                      style={[
                        appointmentTime === slot
                          ? styles.selectedItemText
                          : styles.itemText,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text>No slots available</Text>
              )}
            </>
          )}

          {appointmentTime && (
            <Button
              title="Confirm Appointment"
              onPress={bookAppointment}
              style={styles.confirmButton}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = {
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    marginLeft: 5,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  item: {
    padding: 10,
    backgroundColor: '#ddd',
    marginVertical: 5,
    borderRadius: 5,
  },
  selectedItem: {
    backgroundColor: '#00f',
  },
  selectedItemText: {
    color: '#fff',
  },
  itemText: {
    color: '#000',
  },
  confirmButton: {
    marginTop: 10,
  },
};

export default AddScreen;
