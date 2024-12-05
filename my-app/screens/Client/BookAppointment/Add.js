import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Button,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { firestore } from '../../../firebaseConfig';
import { collection, addDoc, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAuth } from "firebase/auth";
import DateTimePicker from '@react-native-community/datetimepicker';

const AddScreen = () => {
  
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch client data by UID
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
        const specialtiesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSpecialties(specialtiesList);
      } catch (error) {
        console.error('Error fetching specialties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialties();
  }, []);

  useEffect(() => {
    if (selectedSpecialty) {
      fetchServices(selectedSpecialty.id);
      resetState(['service', 'doctor', 'slots']);
    }
  }, [selectedSpecialty]);

  useEffect(() => {
    if (selectedService) {
      fetchAvailableDaysForSpecialty(selectedSpecialty.id); // Call function when both are selected
    }
  }, [selectedService]);

  const resetState = (fields) => {
    if (fields.includes('service')) setSelectedService(null);
    if (fields.includes('doctor')) {
      setSelectedDoctor(null);
      setDoctors([]);
    }
    if (fields.includes('slots')) {
      setAppointmentTime('');
    }
  };

  const fetchServices = async (specialtyId) => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(firestore, 'services'));
      const servicesList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(service => service.specialtyId === specialtyId);
      setServices(servicesList);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentsForSpecialty = async (specialtyId) => {
    const querySnapshot = await getDocs(
      query(collection(firestore, "appointments"), where("specialtyId", "==", specialtyId))
    );
    return querySnapshot.docs.map((doc) => doc.data());
  };

  const fetchDoctors = async (specialtyId) => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(firestore, 'doctors'));
      const doctorsList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doctor => doctor.specialtyId === specialtyId);
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDoctorAvailableSlots = (doctorWorkHours, bookedSlots) => {
    const freeSlots = [];

    doctorWorkHours.forEach(({ weekday, startTime, endTime }) => {
      // Convert startTime and endTime to Date objects
      const workStart = new Date(`1970-01-01T${startTime}:00`);
      const workEnd = new Date(`1970-01-01T${endTime}:00`);

      let currentSlot = new Date(workStart);

      while (currentSlot < workEnd) {
        const nextSlot = new Date(currentSlot);
        nextSlot.setHours(currentSlot.getHours() + 1); // 1-hour slots

        // Check if the current slot overlaps with any booked slots
        const isBooked = bookedSlots.some(
          (booked) =>
            (currentSlot >= booked.startTime && currentSlot < booked.endTime) ||
            (nextSlot > booked.startTime && nextSlot <= booked.endTime)
        );

        if (!isBooked) {
          freeSlots.push({
            startTime: currentSlot.toISOString(),
            endTime: nextSlot.toISOString(),
          });
        }

        currentSlot.setHours(currentSlot.getHours() + 1); // Move to next hour
      }
    });

    return freeSlots;
  };

  const getClosestAvailableDays = (freeSlots) => {
    const today = new Date();
    const upcomingDaysCount = 7;
    const availableDays = [];

    freeSlots.forEach(({ startTime, endTime }) => {
      const start = new Date(startTime);
      const end = new Date(endTime);

      // Only include slots that are within the next 7 days
      if (start >= today && start <= new Date(today.getTime() + upcomingDaysCount * 24 * 60 * 60 * 1000)) {
        availableDays.push({
          doctorId: "doctorId", // Replace with actual doctorId
          startTime: start,
          endTime: end,
        });
      }
    });

    return availableDays;
  };

  const fetchAvailableDaysForSpecialty = async (specialtyId) => {
    try {
      setLoading(true);
  
      // Fetch all appointments and doctors
      const appointments = await fetchAppointmentsForSpecialty(specialtyId);
      const doctorsList = await fetchDoctors(specialtyId);
  
      if (!doctorsList || doctorsList.length === 0) {
        console.warn("No doctors found for this specialty.");
        setAvailableDays([]); // Explicitly clear state if no doctors
        return;
      }
  
      // Process booked slots
      const bookedSlots = appointments.map((appointment) => ({
        startTime: new Date(appointment.startTime),
        endTime: new Date(appointment.endTime),
      }));
  
      // Calculate available slots for each doctor
      const freeSlots = doctorsList.flatMap((doctor) =>
        calculateDoctorAvailableSlots(doctor.workHours, bookedSlots)
      );
  
      const closestAvailableDays = getClosestAvailableDays(freeSlots);
      setAvailableDays(closestAvailableDays);
  
    } catch (error) {
      console.error("Error fetching available days:", error);
      setAvailableDays([]); // Handle errors gracefully
    } finally {
      setLoading(false);
    }
  };
  

  const AvailableDays = ({ days, onSelect }) => (
    <View style={styles.listContainer}>
      <Text style={styles.sectionTitle}>Select a Day:</Text>
      <FlatList
        data={days}
        keyExtractor={(item) => item.day}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedDate(item.date); // Store the selected date
              onSelect(item);
            }}
            style={styles.listItem}
          >
            <Text style={styles.listItemText}>{item.day}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const bookAppointment = async () => {
    if (!appointmentTime || !selectedDay) return alert('Please select an appointment time!');

    try {
      const clientName = await fetchClientData(user.uid, 'name');
      const clientId = await fetchClientData(user.uid, 'userId');
      if (!clientName || !clientId) return alert('Client information is missing!');

      const selectedDateTime = new Date(selectedDate);
      const [hours, minutes] = appointmentTime.split(':');
      selectedDateTime.setHours(parseInt(hours), parseInt(minutes));

      const appointmentEndTime = new Date(selectedDateTime);
      appointmentEndTime.setHours(appointmentEndTime.getHours() + 1); // Assuming 1-hour slots

      const newAppointment = {
        specialtyId: selectedSpecialty.id,
        specialtyName: selectedSpecialty.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        clientId,
        clientName,
        startTime: selectedDateTime,
        endTime: appointmentEndTime,
      };

      await addDoc(collection(firestore, 'appointments'), newAppointment);
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };
  const handleBack = () => {
    if (selectedDay) {
      setSelectedDay(null);
    } else if (selectedService) {
      setSelectedService(null);
    } else if (selectedSpecialty) {
      setSelectedSpecialty(null);
    }
  };

  const SelectionList = ({ data, title, onSelect }) => (
    <View style={styles.listContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onSelect(item)}
            style={styles.listItem}
          >
          <Text style={styles.listItemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Book an Appointment</Text>
        {(selectedSpecialty || selectedService || selectedDay) && (
          <TouchableOpacity onPress={handleBack}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>

      {/* Step 1: Select a Specialty */}
      {!selectedSpecialty && (
        <FlatList
          data={specialties}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => setSelectedSpecialty(item)}
            >
              <Text style={styles.listItemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Select a Specialty</Text>
          }
        />
      )}

      {/* Step 2: Select a Service */}
      {selectedSpecialty && !selectedService && (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => setSelectedService(item)}
            >
              <Text style={styles.listItemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              Select a Service for {selectedSpecialty.name}
            </Text>
          }
        />
      )}

      {/* Step 3: View Available Days */}
      {selectedSpecialty && selectedService && !selectedDay && (
        <FlatList
          data={availableDays} // Fetch or set dynamically
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => setSelectedDay(item)}
            >
              <Text style={styles.listItemText}>{item}</Text>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              Select a Day for {selectedService.name}
            </Text>
          }
        />
      )}

      {/* Step 4: Select an Appointment Slot */}
      {selectedDay && !appointmentTime && (
        <FlatList
          data={[
            { id: 1, time: '10:00 AM' },
            { id: 2, time: '11:00 AM' },
            { id: 3, time: '2:00 PM' },
          ]} // Sample slots; replace with real data
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => setAppointmentTime(item.time)}
            >
              <Text style={styles.listItemText}>{item.time}</Text>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Select a Time Slot</Text>
          }
        />
      )}

      {/* Step 5: Confirm and Book Appointment */}
      {appointmentTime && (
        <View style={styles.actionContainer}>
          <Text style={styles.selectedTime}>
            Selected Time: {appointmentTime}
          </Text>
          <Button
            title="Book Appointment"
            onPress={bookAppointment}
            color="green"
          />
        </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemText: {
    fontSize: 16,
  },
  actionContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  selectedTime: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
});

export default AddScreen;