import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dummy data for example
const doctors = [
  { id: 1, name: 'Dr. John Doe', specialty: 'Cardiology', image: 'https://via.placeholder.com/100' },
  { id: 2, name: 'Dr. Jane Smith', specialty: 'Dermatology', image: 'https://via.placeholder.com/100' },
];

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Welcome Message */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Our Clinic</Text>
        <Text style={styles.subtitle}>Your Health, Our Priority</Text>
      </View>

      {/* Appointment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Book an Appointment</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Agenda')}  // Navigate to Appointment screen
        >
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
      
      {/* Doctor List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Doctors</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {doctors.map(doctor => (
            <View key={doctor.id} style={styles.doctorCard}>
              <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <TouchableOpacity style={styles.notificationCard}>
          <Ionicons name="notifications-outline" size={24} color="black" />
          <Text style={styles.notificationText}>You have an appointment tomorrow at 3:00 PM</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Test')}  // Navigate to Contact screen
        >
          <Text style={styles.buttonText}>Get in Touch</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e3b4e',
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e3b4e',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doctorCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  doctorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  doctorName: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  doctorSpecialty: {
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#6c757d',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  notificationText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  }
});

export default HomeScreen;
