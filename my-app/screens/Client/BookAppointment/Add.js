import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
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
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch client data
  const fetchClientData = async (uid, field) => {
    try {
      const clientDoc = await getDoc(doc(firestore, 'clients', uid));
      return clientDoc.exists() && clientDoc.data()[field] 
        ? clientDoc.data()[field] 
        : `Unknown ${field}`;
    } catch (error) {
      console.error(`Error fetching ${field}:`, error);
      return `Unknown ${field}`;
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch specialties
        const specialtiesSnapshot = await getDocs(collection(firestore, 'specialties'));
        setSpecialties(specialtiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch services
        const servicesSnapshot = await getDocs(collection(firestore, 'services'));
        const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(servicesData);
        setFilteredServices(servicesData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter services when specialty changes
  useEffect(() => {
    if (selectedSpecialty) {
      setFilteredServices(services.filter(service => 
        service.specialtyId === selectedSpecialty.id
      ));
    } else {
      setFilteredServices(services);
    }
  }, [selectedSpecialty, services]);

  useEffect(() => {
    setFilteredServices(services); // Always show all services
  }, [services]);

  // Fetch doctors and slots when service selected
  useEffect(() => {
    const fetchDoctorsAndSlots = async () => {
      if (selectedService && selectedSpecialty) {
        try {
          setLoading(true);
          
          // Fetch doctors
          const doctorsSnapshot = await getDocs(
            query(collection(firestore, 'doctors'), 
              where('specialtyId', '==', selectedSpecialty.id))
          );
          const doctorsData = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setDoctors(doctorsData);

          // Calculate initial slots
          const slots = await calculateAvailableSlots(selectedDate);
          setAvailableSlots(slots);

        } catch (error) {
          console.error('Error fetching doctors:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDoctorsAndSlots();
  }, [selectedService]);

  // Calculate available slots for selected date
  const calculateAvailableSlots = async (date) => {
    if (!selectedSpecialty || !doctors.length) return [];

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const appointmentsSnapshot = await getDocs(
        query(collection(firestore, 'appointments'),
          where('specialtyId', '==', selectedSpecialty.id),
          where('startTime', '>=', startOfDay),
          where('startTime', '<=', endOfDay)
        )
      );

      const bookedSlots = appointmentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
          doctorId: data.doctorId
        };
      });

      const slots = doctors.flatMap(doctor => {
        const workDay = doctor.workHours.find(wh => 
          wh.day === date.toLocaleDateString('en-US', { weekday: 'long' })
        );

        if (!workDay) return [];

        const [startHour, startMinute] = workDay.startTime.split(':').map(Number);
        const [endHour, endMinute] = workDay.endTime.split(':').map(Number);
        
        const startTime = new Date(date);
        startTime.setHours(startHour, startMinute);
        const endTime = new Date(date);
        endTime.setHours(endHour, endMinute);

        let current = new Date(startTime);
        const availableSlots = [];

        while (current < endTime) {
          const slotEnd = new Date(current);
          slotEnd.setHours(current.getHours() + 1);

          const isBooked = bookedSlots.some(appointment => {
            return (
              appointment.doctorId === doctor.id &&
              ((appointment.startTime < slotEnd && appointment.endTime > current) ||
              (appointment.startTime >= current && appointment.endTime <= slotEnd) ||
              (appointment.startTime < current && appointment.endTime > slotEnd))
            );
          });

          if (!isBooked) {
            availableSlots.push({
              id: `${doctor.id}-${current.getTime()}`,
              doctor,
              start: new Date(current),
              end: new Date(slotEnd)
            });
          }

          current.setHours(current.getHours() + 1);
        }

        return availableSlots;
      });

      return slots.sort((a, b) => a.start - b.start);

    } catch (error) {
      console.error('Error calculating slots:', error);
      return [];
    }
  };

  
  // Handle date selection
  const handleDateChange = async (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const slots = await calculateAvailableSlots(date);
      setAvailableSlots(slots);
    }
  };

  // Book appointment
  const bookAppointment = async () => {
    if (!selectedSlot || !user) return;

    try {
      const clientName = await fetchClientData(user.uid, 'name');
      
      const newAppointment = {
        specialtyId: selectedSpecialty.id,
        specialtyName: selectedSpecialty.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        doctorId: selectedSlot.doctor.id,
        doctorName: selectedSlot.doctor.name,
        clientId: user.uid,
        clientName,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end
      };

      await addDoc(collection(firestore, 'appointments'), newAppointment);
      Alert.alert('Sucesso', 'Consulta agendada com sucesso!');
      resetState();

    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Erro', 'Falha ao agendar consulta');
    }
  };

  const resetState = () => {
    setSelectedSpecialty(null);
    setSelectedService(null);
    setSelectedSlot(null);
    setShowConfirmation(false);
    setSelectedDate(new Date());
  };

  // Render methods
  const renderSpecialtyItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.specialtyItem,
        selectedSpecialty?.id === item.id && styles.selectedItem
      ]}
      onPress={() => setSelectedSpecialty(
        selectedSpecialty?.id === item.id ? null : item
      )}
    >
      <Text style={styles.specialtyText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() => setSelectedService(item)}
    >
      <Text style={styles.serviceText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderSlotItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.slotItem,
        selectedSlot?.id === item.id && styles.selectedSlot
      ]}
      onPress={() => {
        setSelectedSlot(item);
        setShowConfirmation(true);
      }}
    >
      <Text style={styles.slotTime}>
        {item.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <Text style={styles.doctorName}>{item.doctor.name}</Text>
      <Text style={styles.slotDuration}>
        {Math.round((item.end - item.start) / (1000 * 60))} min
      </Text>
    </TouchableOpacity>
  );

  const renderConfirmationScreen = () => (
    <ScrollView contentContainerStyle={styles.confirmationContainer}>
      <Text style={styles.confirmationTitle}>Confirmação de Agendamento</Text>
      
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Icon name="stethoscope" size={20} color="#555" />
          <Text style={styles.detailText}>{selectedSpecialty?.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="medkit" size={20} color="#555" />
          <Text style={styles.detailText}>{selectedService?.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="user-md" size={20} color="#555" />
          <Text style={styles.detailText}>{selectedSlot?.doctor.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="calendar" size={20} color="#555" />
          <Text style={styles.detailText}>
            {selectedSlot?.start.toLocaleDateString('pt-BR')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="clock-o" size={20} color="#555" />
          <Text style={styles.detailText}>
            {selectedSlot?.start.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.backButton]}
          onPress={() => setShowConfirmation(false)}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.confirmButton]}
          onPress={bookAppointment}
        >
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {showConfirmation ? (
        renderConfirmationScreen()
      ) : (
        <>
          <View style={styles.header}>
            {selectedService && (
              <TouchableOpacity onPress={() => setSelectedService(null)}>
                <Icon name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
            )}
          </View>

          {!selectedService ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Selecione uma Especialidade</Text>
                <FlatList
                  data={specialties}
                  renderItem={renderSpecialtyItem}
                  keyExtractor={item => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.columns}
                />
              </View>

              { (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Selecione um Serviço</Text>
                  <FlatList
                    data={filteredServices}
                    renderItem={renderServiceItem}
                    keyExtractor={item => item.id}
                  />
                </View>
              )}
            </>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selecione a Data e Horário</Text>
              
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {selectedDate.toLocaleDateString('pt-BR')}
                </Text>
                <Icon name="calendar" size={20} color="#666" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}

              {loading ? (
                <Text style={styles.loadingText}>Carregando horários...</Text>
              ) : (
                <FlatList
                  data={availableSlots}
                  renderItem={renderSlotItem}
                  keyExtractor={item => item.id}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      Nenhum horário disponível para esta data
                    </Text>
                  }
                />
              )}
            </View>
          )}
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#333',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#444',
  },
  columns: {
    justifyContent: 'space-between',
  },
  specialtyItem: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  specialtyText: {
    color: '#333',
    fontSize: 14,
  },
  serviceItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  serviceText: {
    color: '#333',
    fontSize: 16,
  },
  datePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  slotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  selectedItem: {
    backgroundColor: '#f0f0f0',
    borderColor: '#000',
    borderWidth: 1,
  },
  selectedSlot: {
    backgroundColor: '#f0f0f0',
    borderColor: '#000',
    borderWidth: 1,
  },  
  slotTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    width: '30%',
  },
  doctorName: {
    fontSize: 14,
    color: '#666',
    width: '50%',
  },
  slotDuration: {
    fontSize: 12,
    color: '#999',
    width: '20%',
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 15,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 15,
  },
  confirmationContainer: {
    flexGrow: 1,
    padding: 20,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  backButton: {
    backgroundColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddScreen;