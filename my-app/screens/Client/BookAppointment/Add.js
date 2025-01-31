import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { firestore } from '../../../firebaseConfig';
import { collection, addDoc, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAuth } from "firebase/auth";

const AddScreen = () => {
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const auth = getAuth();
  const user = auth.currentUser;

  const fetchClientData = async (uid, field) => {
    try {
      const clientDoc = await getDoc(doc(firestore, 'clients', uid));
      return clientDoc.exists() && clientDoc.data()[field]
        ? clientDoc.data()[field]
        : `Unknown ${field}`;
    } catch (error) {
      console.error(`Error fetching ${field} for UID:`, uid, error);
      return `Unknown ${field}`;
    }
  };

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'specialties'));
        setSpecialties(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching specialties:', error);
      }
    };
    const fetchAllServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'services'));
        const servicesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(servicesList);
        setFilteredServices(servicesList);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchSpecialties();
    fetchAllServices();
  }, []);

  useEffect(() => {
    setFilteredServices(selectedSpecialty 
      ? services.filter(s => s.specialtyId === selectedSpecialty.id) 
      : services
    );
  }, [selectedSpecialty, services]);

  useEffect(() => {
    if (selectedService) {
      fetchAvailableDaysForSpecialty(selectedSpecialty.id);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedDay) {
      const slots = selectedDay.slots.map(slot => ({
        id: slot.startTime,
        doctorId: slot.doctorId,
        startTime: slot.startTime,
        time: new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      setAvailableSlots(slots);
    }
  }, [selectedDay]);

  const fetchAppointmentsForSpecialty = async (specialtyId) => {
    const querySnapshot = await getDocs(
      query(collection(firestore, "appointments"), where("specialtyId", "==", specialtyId))
    );
    return querySnapshot.docs.map(doc => doc.data());
  };

  // Add this helper function inside your component
  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  const fetchDoctors = async (specialtyId) => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'doctors'));
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doctor => doctor.specialtyId === specialtyId);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return [];
    }
  };

  const calculateDoctorAvailableSlots = (doctorWorkHours = [], bookedSlots = [], doctorId) => {
    const freeSlots = [];
    const daysAhead = 7;
    const startDate = new Date();

    for (let i = 0; i < daysAhead; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const currentDayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

      const workHours = doctorWorkHours.find(wh => wh.day === currentDayName);
      if (!workHours) continue;

      const [startHour, startMinute] = workHours.startTime.split(':').map(Number);
      const [endHour, endMinute] = workHours.endTime.split(':').map(Number);

      const workStart = new Date(currentDate);
      workStart.setHours(startHour, startMinute, 0, 0);
      const workEnd = new Date(currentDate);
      workEnd.setHours(endHour, endMinute, 0, 0);

      let currentSlot = new Date(workStart);
      while (currentSlot < workEnd) {
        const nextSlot = new Date(currentSlot);
        nextSlot.setHours(currentSlot.getHours() + 1);

        const isBooked = bookedSlots.some(booked => {
          const bookedStart = new Date(booked.startTime);
          const bookedEnd = new Date(booked.endTime);
          return currentSlot < bookedEnd && nextSlot > bookedStart;
        });

        if (!isBooked) {
          freeSlots.push({
            doctorId,
            startTime: currentSlot.toISOString(),
            endTime: nextSlot.toISOString(),
          });
        }
        currentSlot = nextSlot;
      }
    }
    return freeSlots;
  };

  const fetchAvailableDaysForSpecialty = async (specialtyId) => {
    try {
      const appointments = await fetchAppointmentsForSpecialty(specialtyId);
      const doctorsList = await fetchDoctors(specialtyId);
      setDoctors(doctorsList);

      const bookedSlots = appointments.map(app => ({
        startTime: new Date(app.startTime),
        endTime: new Date(app.endTime),
      }));

      const freeSlots = doctorsList.flatMap(doctor => 
        calculateDoctorAvailableSlots(doctor.workHours || [], bookedSlots, doctor.id)
      );

      const groupedDays = freeSlots.reduce((acc, slot) => {
        const dateKey = new Date(slot.startTime).toISOString().split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = { date: dateKey, slots: [] };
        acc[dateKey].slots.push(slot);
        return acc;
      }, {});

      setAvailableDays(Object.values(groupedDays));
    } catch (error) {
      console.error("Error fetching available days:", error);
      setAvailableDays([]);
    }
  };

  const bookAppointment = async () => {
    if (!selectedSlot || !selectedDay) {
      alert('Please select a time slot!');
      return;
    }

    try {
      const clientName = await fetchClientData(user.uid, 'name');
      const clientId = user.uid;

      const doctor = doctors.find(d => d.id === selectedSlot.doctorId);
      if (!doctor) throw new Error('Doctor not found');

      const newAppointment = {
        specialtyId: selectedSpecialty.id,
        specialtyName: selectedSpecialty.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        clientId,
        clientName,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      };

      await addDoc(collection(firestore, 'appointments'), newAppointment);
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment.');
    }
  };

  const handleBack = () => {
    if (selectedDay) {
      setSelectedDay(null);
      setAvailableSlots([]);
      setSelectedSlot(null);
    } else if (selectedService) {
      setSelectedService(null);
    } else if (selectedSpecialty) {
      setSelectedSpecialty(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        {(selectedSpecialty || selectedService || selectedDay) && (
          <TouchableOpacity onPress={handleBack}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>

      {!selectedService ? (
        <>
          <FlatList
            data={specialties}
            numColumns={3}
            columnWrapperStyle={styles.columnWrapper}
            keyExtractor={item => item.id}
            ListHeaderComponent={<Text style={styles.sectionTitle}>Filter by Specialty</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.squareItem,
                  selectedSpecialty?.id === item.id && styles.selectedItem
                ]}
                onPress={() => setSelectedSpecialty(prev => prev?.id === item.id ? null : item)}
              >
                <Text style={styles.listItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />

          <FlatList
            data={filteredServices}
            keyExtractor={item => item.id}
            ListHeaderComponent={<Text style={styles.sectionTitle}>Select a Service</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => setSelectedService(item)}
              >
                <Text style={styles.listItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : !selectedDay ? (
        <FlatList
          data={availableDays}
          keyExtractor={(item) => item.date}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Select a Day for {selectedService.name}</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => setSelectedDay(item)}
            >
              <Text style={styles.listItemText}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <>
          <FlatList
            data={availableSlots}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  selectedSlot?.id === item.id && styles.selectedItem
                ]}
                onPress={() => setSelectedSlot(item)}
              >
                <Text>
                  {item.time} - {getDoctorName(item.doctorId)}
                </Text>
              </TouchableOpacity>
            )}
          />
          {selectedSlot && (
            <TouchableOpacity style={styles.button} onPress={bookAppointment}>
              <Text style={styles.buttonText}>Book Appointment</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  squareItem: {
    backgroundColor: '#fff',
    width: 100,
    height: 100,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  selectedItem: {
    borderColor: 'black',
    borderWidth: 2,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  listItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddScreen;