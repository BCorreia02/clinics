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
  const [availableSlots, setAvailableSlots] = useState([]);  // Add this state initialization

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

  useEffect(() => {
    if (selectedDay) {
      console.log("Selected Day:", selectedDay); // Debugging
      const slotsForDay = fetchAvailableSlotsForDay(selectedDay.date);
      console.log("Slots for Selected Day:", slotsForDay); // Debugging
      setAvailableSlots(slotsForDay);
    }
  }, [selectedDay]);

  const resetState = (fields) => {
    if (fields.includes('service')) setSelectedService(null);
    if (fields.includes('doctor')) {
      setSelectedDoctor(null);
      setDoctors([]);
    }
    if (fields.includes('slots')) {
      setAvailableSlots([]);
      setAppointmentTime('');
    }
  };

  const fetchServices = async (specialtyId) => {
    try {
      console.log("Fetching services for specialty ID:", specialtyId);
      setLoading(true);
      const querySnapshot = await getDocs(collection(firestore, 'services'));
      const servicesList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(service => service.specialtyId === specialtyId);
  
      console.log("Services found:", servicesList);
      if (servicesList.length === 0) {
        console.warn("No services found for this specialty:", specialtyId);
      }
  
      setServices(servicesList);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlotsForDay = (selectedDay) => {
    console.log("Selected day:", selectedDay);
    console.log("Available days start times:", availableDays.map((slot) => slot.startTime));
  
    const daySlots = availableDays.filter(
      (slot) => new Date(slot.startTime).toLocaleDateString() === new Date(selectedDay).toLocaleDateString()
    );
  
    console.log("Day slots:", daySlots);
  
    return daySlots.map((slot) => ({
      id: slot.startTime, // Ensure each slot has a unique identifier
      time: new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      available: true, // You can modify this logic to account for availability
    }));
  };
  

  const fetchAppointmentsForSpecialty = async (specialtyId) => {
    const querySnapshot = await getDocs(
      query(collection(firestore, "appointments"), where("specialtyId", "==", specialtyId))
    );
    return querySnapshot.docs.map((doc) => doc.data());
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

  const calculateDoctorAvailableSlots = (doctorWorkHours, bookedSlots, doctorId) => {
    const freeSlots = [];
    
    // Get today's weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const today = new Date();
    const todayWeekday = today.getDay();
  
    doctorWorkHours.forEach(({ day, startTime, endTime }) => {
      // Skip if the doctor's working day doesn't match today's weekday
      if (day === "Sunday" && todayWeekday !== 0) return; // Handle Sunday
      if (day === "Monday" && todayWeekday !== 1) return; // Handle Monday
      if (day === "Tuesday" && todayWeekday !== 2) return; // Handle Tuesday
      if (day === "Wednesday" && todayWeekday !== 3) return; // Handle Wednesday
      if (day === "Thursday" && todayWeekday !== 4) return; // Handle Thursday
      if (day === "Friday" && todayWeekday !== 5) return; // Handle Friday
      if (day === "Saturday" && todayWeekday !== 6) return; // Handle Saturday
  
      // Convert startTime and endTime to Date objects (with dummy date for comparison)
      const workStart = new Date(`1970-01-01T${startTime}:00`);
      const workEnd = new Date(`1970-01-01T${endTime}:00`);
  
      let currentSlot = new Date(workStart);
  
  
      // Check for available slots within the doctor's working hours
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
            doctorId, // Add doctorId to each free slot
            startTime: currentSlot.toISOString(),
            endTime: nextSlot.toISOString(),
          });
        }
  
        // Move to the next hour
        currentSlot.setHours(currentSlot.getHours() + 1);
      }
    });
    return freeSlots;
};


const fetchAvailableDaysForSpecialty = async (specialtyId) => {
  try {
    setLoading(true);

    const appointments = await fetchAppointmentsForSpecialty(specialtyId);
    const doctorsList = await fetchDoctors(specialtyId);

    if (!doctorsList || doctorsList.length === 0) {
      setAvailableDays([]);
      return;
    }

    const bookedSlots = appointments.map((appointment) => ({
      startTime: new Date(appointment.startTime),
      endTime: new Date(appointment.endTime),
    }));

    const freeSlots = doctorsList.flatMap((doctor) =>
      calculateDoctorAvailableSlots(doctor.workHours, bookedSlots, doctor.id)
    );

    const groupedDays = freeSlots.reduce((acc, slot) => {
      const date = new Date(slot.startTime).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(slot);
      return acc;
    }, {});

    const availableDaysArray = Object.keys(groupedDays).map((date) => ({
      date,
      slots: groupedDays[date],
    }));

    setAvailableDays(availableDaysArray);
  } catch (error) {
    console.error("Error fetching available days:", error);
    setAvailableDays([]);
  } finally {
    setLoading(false);
  }
};
  
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

const parseTime = (timeString) => {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

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
        data={availableDays} 
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => setSelectedDay(item)}
            >
              <Text style={styles.listItemText}>
                {item.date} {/* Display day */}
              </Text>
            </TouchableOpacity>

            {/* Show slots only when a day is selected */}
            {selectedDay === item && (
              <FlatList
              data={slotsForDay || []} // Ensure 'slots' is always an array
              renderItem={({ item }) => {
                if (item && item.time && item.id) {
                  const slotTime = new Date(item.time);
                  return <Text>{parseTime(slotTime.toString())}</Text>;
                } else {
                  return <Text>Invalid Slot Data</Text>;
                }
              }}
            />
            )}
          </View>
        )}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            Select a Day for {selectedService.name}
          </Text>
        }
      />
    )}

    {/* Step 4: Select an Appointment Slot */}
    {selectedDay && availableSlots.length > 0 && (
      <FlatList
        data={availableSlots}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => setAppointmentTime(item.time)}
          >
            <Text>{item.time}</Text>
          </TouchableOpacity>
        )}
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