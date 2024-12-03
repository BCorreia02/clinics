import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { firestore } from '../../../firebaseConfig';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { Calendar } from 'react-native-calendars';

const CreateAvailability = ({ route }) => {
  const { selectedDoctor, selectedSpecialty } = route.params;  // Get data from navigation params

  if (!selectedDoctor || !selectedSpecialty) {
    return <Text>Doctor or Specialty data not available</Text>;
  }

  const [selectedDate, setSelectedDate] = useState(null);
  const [timeslots, setTimeslots] = useState([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState(null);
  const [existingAvailabilities, setExistingAvailabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const availableTimes = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM']; // Example timeslots

  // Fetch existing availabilities for the doctor
  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        setIsLoading(true);
        const availabilitiesRef = collection(firestore, `doctors/${selectedDoctor.id}/availabilities`);
        const q = query(availabilitiesRef, where('specialty', '==', selectedSpecialty));
        const querySnapshot = await getDocs(q);
        const availabilitiesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExistingAvailabilities(availabilitiesList);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching availabilities:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Failed to fetch availabilities');
      }
    };

    fetchAvailabilities();
  }, [selectedDoctor.id, selectedSpecialty]);

  const handleTimeslotSelection = (date) => {
    setSelectedDate(date);
    setTimeslots(availableTimes); // Display available times for the selected date
  };

  const handleCreateAvailability = async () => {
    if (!selectedDate || !selectedTimeslot) {
      Alert.alert('Error', 'Please select a date and a timeslot');
      return;
    }

    try {
      const availabilityData = {
        date: selectedDate,
        time: selectedTimeslot,
        specialty: selectedSpecialty,
        doctorId: selectedDoctor.id,
      };

      // Save the availability data to Firebase
      await addDoc(collection(firestore, `doctors/${selectedDoctor.id}/availabilities`), availabilityData);
      Alert.alert('Success', 'Availability added successfully');
      setSelectedDate(null);
      setSelectedTimeslot(null);
      setTimeslots([]); // Reset timeslots
    } catch (error) {
      console.error('Error creating availability:', error);
      Alert.alert('Error', 'An error occurred while creating availability');
    }
  };

  const handleDeleteAvailability = async (id) => {
    try {
      await deleteDoc(doc(firestore, `doctors/${selectedDoctor.id}/availabilities`, id));
      setExistingAvailabilities(existingAvailabilities.filter(item => item.id !== id)); // Remove the deleted item from the state
      Alert.alert('Success', 'Availability deleted successfully');
    } catch (error) {
      console.error('Error deleting availability:', error);
      Alert.alert('Error', 'An error occurred while deleting availability');
    }
  };

  const handleEditAvailability = (availability) => {
    setSelectedDate(availability.date);
    setSelectedTimeslot(availability.time);
    setTimeslots([availability.time]); // Set the timeslot to the one being edited
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Define Availability for {selectedDoctor.name}</Text>
      <Text style={styles.subtitle}>Specialty: {selectedSpecialty}</Text>

      {isLoading ? (
        <Text>Loading existing availabilities...</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.subtitle}>Existing Availabilities:</Text>
          {existingAvailabilities.length === 0 ? (
            <Text>No availabilities found</Text>
          ) : (
            existingAvailabilities.map((availability) => (
              <View key={availability.id} style={styles.availabilityItem}>
                <Text>{availability.date} - {availability.time}</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEditAvailability(availability)}>
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteAvailability(availability.id)}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Text style={styles.subtitle}>Select Date:</Text>
      <Calendar
        onDayPress={(day) => handleTimeslotSelection(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: 'blue' },
        }}
      />

      {selectedDate && (
        <View>
          <Text style={styles.subtitle}>Select Timeslot:</Text>
          {timeslots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.timeslotButton, selectedTimeslot === slot && styles.selectedTimeslot]}
              onPress={() => setSelectedTimeslot(slot)}
            >
              <Text style={styles.timeslotText}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleCreateAvailability}>
        <Text style={styles.buttonText}>Save Availability</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  availabilityItem: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: 'orange',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeslotButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  selectedTimeslot: {
    backgroundColor: 'green',
  },
  timeslotText: {
    color: '#333',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    marginTop: 20,
    borderRadius: 5,
  },
});

export default CreateAvailability;
