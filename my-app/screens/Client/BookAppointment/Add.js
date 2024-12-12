import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Button,
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
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

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
    const fetchAllServices = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(firestore, 'services'));
        const servicesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesList);
        setFilteredServices(servicesList);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialties();
    fetchAllServices();
  }, []);

  useEffect(() => {
    if (selectedSpecialty) {
      const filtered = services.filter(service => service.specialtyId === selectedSpecialty.id);
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [selectedSpecialty, services]);

  useEffect(() => {
    if (selectedService) {
      fetchAvailableDaysForSpecialty(selectedSpecialty.id);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedDay) {
      const slotsForDay = fetchAvailableSlotsForDay(selectedDay);
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

  

  const fetchAvailableSlotsForDay = (selectedDay) => {
    const selectedDate = new Date(selectedDay.date);

    const daySlots = availableDays.find((day) => 
      new Date(day.date).toLocaleDateString() === selectedDate.toLocaleDateString()
    );

    if (daySlots) {
      return daySlots.slots.map((slot) => ({
        id: slot.startTime,
        time: new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        available: true,
      }));
    }

    return [];
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
      const doctorsList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doctor => doctor.specialtyId === specialtyId);
  
      // Ensure workHours is initialized
      return doctorsList.map(doctor => ({
        ...doctor,
        workHours: doctor.workHours || [] // Default to empty array if undefined
      }));
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return [];
    }
  };

  const calculateDoctorAvailableSlots = (doctorWorkHours = [], bookedSlots = [], doctorId) => {
    const freeSlots = [];
    const today = new Date();
    const todayWeekday = today.getDay();
  
    if (!doctorWorkHours || !Array.isArray(doctorWorkHours)) {
      console.error('Invalid doctor work hours:', doctorWorkHours);
      return freeSlots; // Return empty if data is invalid
    }

    doctorWorkHours.forEach(({ day, startTime, endTime }) => {
      if (day === "Sunday" && todayWeekday !== 0) return;
      if (day === "Monday" && todayWeekday !== 1) return;
      if (day === "Tuesday" && todayWeekday !== 2) return;
      if (day === "Wednesday" && todayWeekday !== 3) return;
      if (day === "Thursday" && todayWeekday !== 4) return;
      if (day === "Friday" && todayWeekday !== 5) return;
      if (day === "Saturday" && todayWeekday !== 6) return;

      const workStart = new Date(`1970-01-01T${startTime}:00`);
      const workEnd = new Date(`1970-01-01T${endTime}:00`);
      let currentSlot = new Date(workStart);

      while (currentSlot < workEnd) {
        const nextSlot = new Date(currentSlot);
        nextSlot.setHours(currentSlot.getHours() + 1);

        const isBooked = bookedSlots.some(
          (booked) =>
            (currentSlot >= booked.startTime && currentSlot < booked.endTime) ||
            (nextSlot > booked.startTime && nextSlot <= booked.endTime)
        );

        if (!isBooked) {
          freeSlots.push({
            doctorId,
            startTime: currentSlot.toISOString(),
            endTime: nextSlot.toISOString(),
          });
        }

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
  if (!appointmentTime || !selectedDay) {
    return alert('Please select an appointment time and a day!');
  }

  if (!selectedSpecialty || !selectedService || !selectedDoctor) {
    return alert('Please ensure all selections are made!');
  }

  try {
    const clientName = await fetchClientData(user.uid, 'name');
    const clientId = await fetchClientData(user.uid, 'userId');
    if (!clientName || !clientId) return alert('Client information is missing!');

    const selectedDateTime = new Date(selectedDate);
    const [hours, minutes] = appointmentTime.split(':');
    selectedDateTime.setHours(parseInt(hours), parseInt(minutes));

    const appointmentEndTime = new Date(selectedDateTime);
    appointmentEndTime.setHours(appointmentEndTime.getHours() + 1);

    const newAppointment = {
      specialtyId: selectedSpecialty?.id,
      specialtyName: selectedSpecialty?.name,
      serviceId: selectedService?.id,
      serviceName: selectedService?.name,
      doctorId: selectedDoctor?.id,
      doctorName: selectedDoctor?.name,
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
        {/* Step 1: Specialty Selection for Filtering Services */}
        <View style={styles.specialtiesContainer}>
          <FlatList
            data={specialties}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ flex: 1, alignItems: 'center' }}>
                <TouchableOpacity
                  style={[
                    styles.squareItem,
                    selectedSpecialty && selectedSpecialty.id === item.id && styles.selectedItem
                  ]}
                  onPress={() => {
                    setSelectedSpecialty(selectedSpecialty && selectedSpecialty.id === item.id ? null : item);
                  }}
                >
                  <Text style={styles.listItemText}>{item.name}</Text>
                </TouchableOpacity>
              </View>
            )}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>Filter by Specialty</Text>
            }
          />
        </View>

        {/* Step 2: List of Services */}
        <View style={styles.servicesContainer}>
          <FlatList
            data={filteredServices}
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
              <Text style={styles.sectionTitle}>Select a Service</Text>
            }
          />
        </View>
      </>
    ) : (
      <>
        {/* Step 3: View Available Days */}
        {selectedSpecialty && selectedService && !selectedDay && (
          <FlatList
            data={availableDays}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => setSelectedDay(item)}
              >
                <Text style={styles.listItemText}>
                  {item.date}
                </Text>
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
        {selectedDay && availableSlots.length > 0 && (
          <FlatList
            data={availableSlots}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  appointmentTime === item.time ? styles.selectedItem : null, // Apply selectedItem style conditionally
                ]}
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
            <TouchableOpacity
              style={styles.button}
              onPress={bookAppointment}
            >
              <Text style={styles.buttonText}>Book Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    )}
  </KeyboardAvoidingView>
);
}

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
  specialtiesContainer: {
    maxHeight: 150,
    marginTop: 16,
  },
  servicesContainer: {
    flex: 1,
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
  actionContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  selectedTime: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    marginBottom: '20px',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonLoading: {
    backgroundColor: '#000',
  },
  
}); 

export default AddScreen;