import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, FlatList, Button } from 'react-native';
import { firestore } from '../../../firebaseConfig';
import { collection, addDoc, getDocs, getDoc, doc } from 'firebase/firestore';
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
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
      fetchDoctors(selectedSpecialty.id);
      resetState(['doctor', 'slots']);
    }
  }, [selectedService]);

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

  const fetchAvailableSlots = async (doctorId) => {
    try {
      setLoading(true);
  
      // Fetch the doctor's available slots
      const doctorDoc = await getDoc(doc(firestore, "doctors", doctorId));
      const availableSlots = doctorDoc.exists() ? doctorDoc.data().availableSlots || [] : [];
      
      // Fetch all appointments for the doctor to find booked slots
      const appointments = await getDocs(collection(firestore, "appointments"));
      const bookedSlots = appointments.docs
        .filter(appointment => appointment.data().doctorId === doctorId)
        .map(appointment => ({
          startTime: new Date(appointment.data().startTime),
          endTime: new Date(appointment.data().endTime),
        }));
  
      // Calculate the available slots for the nearest days
      const freeSlotsByDay = calculateFreeSlotsForUpcomingDays(availableSlots, bookedSlots);
      setAvailableSlots(freeSlotsByDay);
    } catch (error) {
      console.error("Error fetching available slots:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const calculateFreeSlotsForUpcomingDays = (availableSlots, bookedSlots) => {
    const freeSlotsByDay = {};
    const currentDate = new Date();
    const upcomingDaysCount = 7; // Number of upcoming days to check (You can adjust this)
  
    const parseTime = (time) => {
      const [hours, minutes, period] = time.match(/(\d+):(\d+)\s*(AM|PM)/).slice(1);
      const hour = period === "PM" && hours !== "12" ? parseInt(hours) + 12 : parseInt(hours);
      return { hour, minutes: parseInt(minutes) };
    };
  
    // Loop through the upcoming days (from today onward)
    for (let i = 0; i < upcomingDaysCount; i++) {
      const day = new Date(currentDate);
      day.setDate(currentDate.getDate() + i); // Move to the next day
  
      const formattedDay = day.toLocaleDateString([], { weekday: 'long' }); // Get day name (e.g., "Monday")
  
      availableSlots.forEach(({ day: slotDay, startTime, endTime }) => {
        if (slotDay === formattedDay) {
          const start = new Date(day);
          const end = new Date(day);
  
          const { hour: startHour, minutes: startMinutes } = parseTime(startTime);
          const { hour: endHour, minutes: endMinutes } = parseTime(endTime);
  
          start.setHours(startHour, startMinutes, 0, 0);
          end.setHours(endHour, endMinutes, 0, 0);
  
          let current = new Date(start);
  
          // Check for available slots and ensure no overlaps with booked slots
          while (current < end) {
            const slotEnd = new Date(current);
            slotEnd.setHours(current.getHours() + 1);
  
            const isBooked = bookedSlots.some(
              (booked) =>
                (current >= booked.startTime && current < booked.endTime) ||
                (slotEnd > booked.startTime && slotEnd <= booked.endTime)
            );
  
            if (!isBooked) {
              if (!freeSlotsByDay[formattedDay]) freeSlotsByDay[formattedDay] = [];
              freeSlotsByDay[formattedDay].push({
                startTime: current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                endTime: slotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
            }
  
            current.setHours(current.getHours() + 1);
          }
        }
      });
    }
  
    return freeSlotsByDay;
  };
  

  const bookAppointment = async () => {
    if (!appointmentTime) return alert('Please select an appointment time!');
    
    try {
      const clientName = await fetchClientData(user.uid, 'name');
      const clientId = await fetchClientData(user.uid, 'userId');
      if (!clientName || !clientId) return alert('Client information is missing!');

      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = appointmentTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      const newAppointment = {
        specialtyId: selectedSpecialty.id,
        specialtyName: selectedSpecialty.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        clientId,
        clientName,
        createdAt: new Date().toISOString(),
        time: appointmentDateTime.toISOString(), // Use combined date and time
        status: 'pending',
      };

      await addDoc(collection(firestore, 'appointments'), newAppointment);
      alert('Appointment booked successfully!');
      resetState(['service', 'doctor', 'slots']);
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  const handleBack = () => {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book an Appointment</Text>
        {selectedSpecialty && (
         <TouchableOpacity onPress={handleBack} style={styles.backButton}>
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
            <SelectionList
              data={specialties}
              title="Select a Specialty:"
              onSelect={setSelectedSpecialty}
            />
          )}
          {selectedSpecialty && !selectedService && (
            <SelectionList
              data={services}
              title={`Select a Service in ${selectedSpecialty.name}:`}
              onSelect={setSelectedService}
            />
          )}
          {selectedService && !selectedDoctor && (
            <SelectionList
              data={doctors}
              title="Select a Doctor:"
              onSelect={(doctor) => {
                setSelectedDoctor(doctor);
                fetchAvailableSlots(doctor.id);
              }}
            />
          )}
          {selectedDoctor && Object.keys(availableSlots).length > 0 ? (
            <>
            <Text style={styles.sectionTitle}>Available Slots</Text>
            <ScrollView style={styles.slotContainer}>
              {Object.keys(availableSlots).map((day) => (
                <View key={day} style={styles.dayContainer}>
                  <Text style={styles.dayTitle}>{day}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {availableSlots[day].map((slot, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setAppointmentTime(slot.startTime)}
                        style={[
                          styles.slot,
                          appointmentTime === slot.startTime && styles.selectedSlot, // Highlight selected slot
                        ]}
                      >
                        <Text style={styles.slotText}>
                          {slot.startTime} - {slot.endTime}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ))}
            </ScrollView>
          </>
    ) : (
      <Text style={styles.noSlotsText}>
        No available slots for the selected doctor. Please select another doctor or try again later.
      </Text>
    )}
          {appointmentTime && (
            <Button title="Confirm Appointment" onPress={bookAppointment} />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 5,
    color: '#000',
    fontSize: 16,
  },
  listContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  listItem: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  listItemText: {
    fontSize: 18,
    color: '#333',
  },
  slotContainer: {
    marginVertical: 10,
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#000',
  },
  slot: {
    padding: 15,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  selectedSlot: {
    backgroundColor: '#fff',
    borderColor: '#0056b3',
  },
  slotText: {
    color: '#333',
    fontSize: 16,
  },
  noSlotsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  dateContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 18,
    color: '#333',
  },
});

export default AddScreen;
