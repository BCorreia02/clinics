import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';

const AddScreen = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  const handleAddAppointment = () => {
    if (!title || !date || !time) {
      setMessage('Please fill in all fields');
      return;
    }
    // Logic to handle the appointment creation, e.g., saving it to a database
    setMessage('Appointment added successfully!');
    // Reset the form
    setTitle('');
    setDate('');
    setTime('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create an Appointment</Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Appointment Title"
      />

      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="Appointment Date (YYYY-MM-DD)"
      />

      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="Appointment Time (HH:MM)"
      />

      <Button title="Add Appointment" onPress={handleAddAppointment} />

      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    color: 'green',
  },
});

export default AddScreen;
