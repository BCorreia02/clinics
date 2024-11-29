import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { StyleSheet } from 'react-native'; // Add this import if using StyleSheet

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
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {/* Welcome Message */}
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2e3b4e' }}>Welcome to Our Clinic</Text>
        <Text style={{ fontSize: 18, color: '#6c757d' }}>Your Health, Our Priority</Text>
      </View>

      {/* Appointment Section */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2e3b4e', marginBottom: 10 }}>Book an Appointment</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#28a745',
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('Agenda')}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* Doctor List */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2e3b4e', marginBottom: 10 }}>Our Doctors</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#28a745" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <View key={doctor.id} style={{ alignItems: 'center', marginRight: 20 }}>
                  <Image
                    source={{ uri: doctor.image || 'https://via.placeholder.com/100' }}
                    style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
                  />
                  <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{doctor.name}</Text>
                  <Text style={{ fontStyle: 'italic', textAlign: 'center', color: '#6c757d' }}>
                    {doctor.specialty}
                  </Text>
                </View>
              ))
            ) : (
              <Text>No doctors found.</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Notifications */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2e3b4e', marginBottom: 10 }}>Notifications</Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <Ionicons name="notifications-outline" size={24} color="black" />
          <Text style={{ marginLeft: 10, fontSize: 16, color: '#333' }}>
            You have an appointment tomorrow at 3:00 PM
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contact Information */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2e3b4e', marginBottom: 10 }}>Contact Us</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#28a745',
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('LoadingScreen')}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Get in Touch</Text>
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
