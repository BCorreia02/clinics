import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Picker, Alert } from 'react-native';
import { firestore } from '../../firebaseConfig'; // Firebase config
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';

const AvailabilityManagement = ({ route, navigation }) => {
  const { doctorId, specialtyId, serviceId } = route.params;
  const [availability, setAvailability] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [days] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  const [times] = useState(['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM']);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const availabilityRef = collection(firestore, `doctors/${doctorId}/specialties/${specialtyId}/services/${serviceId}/availability`);
        const snapshot = await availabilityRef.get();
        const availabilityList = snapshot.docs.map(doc => doc.data());
        setAvailability(availabilityList);
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    fetchAvailability();
  }, [doctorId, specialtyId, serviceId]);

  const handleAddAvailability = async () => {
    if (!selectedDay || !selectedTime) {
      Alert.alert('Error', 'Please select both day and time.');
      return;
    }

    try {
      const availabilityRef = collection(firestore, `doctors/${doctorId}/specialties/${specialtyId}/services/${serviceId}/availability`);
      await addDoc(availabilityRef, {
        day: selectedDay,
        time: selectedTime,
        serviceId,
        specialtyId,
        doctorId,
      });
      setAvailability([...availability, { day: selectedDay, time: selectedTime }]);
      setSelectedDay('');
      setSelectedTime('');
      Alert.alert('Success', 'Availability added successfully!');
    } catch (error) {
      console.error('Error adding availability:', error);
      Alert.alert('Error', 'Failed to add availability.');
    }
  };

  const renderAvailabilityItem = ({ item }) => (
    <View style={{ padding: 10 }}>
      <Text>{`Day: ${item.day}, Time: ${item.time}`}</Text>
    </View>
  );

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Manage Availability</Text>

      <Picker
        selectedValue={selectedDay}
        onValueChange={(itemValue) => setSelectedDay(itemValue)}
        style={{ height: 50, width: 150, marginTop: 20 }}
      >
        <Picker.Item label="Select Day" value="" />
        {days.map((day, index) => (
          <Picker.Item key={index} label={day} value={day} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedTime}
        onValueChange={(itemValue) => setSelectedTime(itemValue)}
        style={{ height: 50, width: 150, marginTop: 20 }}
      >
        <Picker.Item label="Select Time" value="" />
        {times.map((time, index) => (
          <Picker.Item key={index} label={time} value={time} />
        ))}
      </Picker>

      <Button title="Add Availability" onPress={handleAddAvailability} />

      <FlatList
        data={availability}
        renderItem={renderAvailabilityItem}
        keyExtractor={(item, index) => index.toString()}
        style={{ marginTop: 20 }}
      />
    </View>
  );
};

export default AvailabilityManagement;
