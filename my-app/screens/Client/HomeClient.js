import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'doctors'));
        const doctorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(doctorsList);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.log('Error fetching doctors:', error);
        setLoading(false); // Ensure loading is set to false even if there's an error
      }
    };

    fetchDoctors();
  }, []);

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
          onPress={() => navigation.navigate('Agenda')}
        >
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* Doctor List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Doctors</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#28a745" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <View key={doctor.id} style={styles.doctorCard}>
                  <Image
                    source={{ uri: doctor.image || 'https://via.placeholder.com/100' }}
                    style={styles.doctorImage}
                  />
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDoctorsText}>No doctors found.</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.notificationCard}
        >
          <Ionicons name="notifications-outline" size={24} color="black" />
          <Text style={styles.notificationText}>
            You have an appointment tomorrow at 3:00 PM
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LoadingScreen')}
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
    backgroundColor: '#fff', // White background
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000', // Use consistent color for titles
  },
  subtitle: {
    fontSize: 18,
    color: '#000', // Soft gray for subtitle
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#000', // Consistent green button color
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
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
    color: '#6c757d', // Gray for specialty text
  },
  noDoctorsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d', // Light gray for empty state text
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Light gray background for notification
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  notificationText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000', // Dark text color for notification message
  },
});

export default HomeScreen;
