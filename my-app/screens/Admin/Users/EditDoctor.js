import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Time picker library

const EditDoctor = ({ route, navigation }) => {
  const { doctorId } = route.params; // Retrieve doctorId from the navigation params
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([
    { day: 'Monday', startTime: '', endTime: '' },
    { day: 'Tuesday', startTime: '', endTime: '' },
    { day: 'Wednesday', startTime: '', endTime: '' },
    { day: 'Thursday', startTime: '', endTime: '' },
    { day: 'Friday', startTime: '', endTime: '' },
  ]);
  const [isStartTimeVisible, setStartTimeVisible] = useState(false);
  const [isEndTimeVisible, setEndTimeVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [currentField, setCurrentField] = useState(null);

  // Fetch doctor details from Firebase
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorDoc = await getDoc(doc(firestore, 'doctors', doctorId));
        if (doctorDoc.exists()) {
          const doctorData = doctorDoc.data();
          setDoctor(doctorData);
          setAvailability(doctorData.availableSlots || availability); // If doctor has availability, use it
        } else {
          Alert.alert('Error', 'Doctor not found');
        }
      } catch (error) {
        console.error('Error fetching doctor:', error);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const handleAvailabilityChange = (index, field, value) => {
    const updatedAvailability = [...availability];
    updatedAvailability[index][field] = value;
    setAvailability(updatedAvailability);
  };

  const handleTimeConfirm = (time) => {
    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (currentField === 'startTime') {
      handleAvailabilityChange(currentIndex, 'startTime', formattedTime);
    } else {
      handleAvailabilityChange(currentIndex, 'endTime', formattedTime);
    }
    setStartTimeVisible(false);
    setEndTimeVisible(false);
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(firestore, 'doctors', doctorId), {
        workHours: availability,
      });
      Alert.alert('Success', 'Availability updated successfully');
      navigation.goBack(); // Go back to the previous screen
    } catch (error) {
      Alert.alert('Error', 'Failed to update availability');
      console.error('Error updating availability:', error);
    }
  };

  const renderTimeInput = (slot, index, field) => {
    return (
      <TouchableOpacity
        style={styles.timeInput}
        onPress={() => {
          setCurrentIndex(index);
          setCurrentField(field);
          field === 'startTime' ? setStartTimeVisible(true) : setEndTimeVisible(true);
        }}
      >
        <Text style={styles.timeText}>{slot[field] || `Set ${field === 'startTime' ? 'Start' : 'End'} Time`}</Text>
      </TouchableOpacity>
    );
  };

  const handleApplyToAllDays = () => {
    const startTime = availability[0].startTime;
    const endTime = availability[0].endTime;

    if (!startTime || !endTime) {
      Alert.alert('Error', 'Please set the time for at least one day before applying to all days.');
      return;
    }

    const updatedAvailability = availability.map((slot) => ({
      ...slot,
      startTime,
      endTime,
    }));
    setAvailability(updatedAvailability);
  };

  if (!doctor) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Availability for {doctor.name}</Text>

      {availability.map((slot, index) => (
        <View key={index} style={styles.timeSlot}>
          <Text style={styles.dayText}>{slot.day}</Text>
          <View style={styles.timeBar}>
            {renderTimeInput(slot, index, 'startTime')}
            <Text style={styles.separator}>-</Text>
            {renderTimeInput(slot, index, 'endTime')}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.applyButton} onPress={handleApplyToAllDays}>
        <Text style={styles.applyButtonText}>Apply to All Days</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Availability</Text>
      </TouchableOpacity>

      {/* Start Time Picker */}
      <DateTimePickerModal
        isVisible={isStartTimeVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setStartTimeVisible(false)}
      />

      {/* End Time Picker */}
      <DateTimePickerModal
        isVisible={isEndTimeVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setEndTimeVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timeSlot: {
    marginBottom: 15,
  },
  dayText: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  timeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInput: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: 16,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default EditDoctor;
