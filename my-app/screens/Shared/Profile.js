import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { auth, firestore } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const ProfileScreen = ({ navigation, handleLogout, role }) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || 'John Doe');
            setUserEmail(userData.email || 'john.doe@example.com');
            setProfileImage(userData.profileImage || 'https://via.placeholder.com/100');
          }

          const appointmentsDoc = await getDoc(doc(firestore, role === 'doctor' ? 'doctorAppointments' : 'consultas', user.uid));
          if (appointmentsDoc.exists()) {
            const appointmentsData = appointmentsDoc.data().appointments || [];
            setAppointments(appointmentsData);
          }
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [role]);

  const sections = [
    {
      id: 'header',
      render: () => (
        <View style={styles.header}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <Text style={styles.title}>{userName}</Text>
          <Text style={styles.subtitle}>{userEmail}</Text>
        </View>
      ),
    },
    {
      id: 'appointments',
      render: () => (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{role === 'doctor' ? 'Your Patients' : 'Appointment History'}</Text>
          {appointments.map((item) => (
            <View key={item.id} style={styles.appointmentItem}>
              <Text style={styles.appointmentTitle}>{item.title}</Text>
              <Text style={styles.appointmentDate}>{item.date}</Text>
              <Text style={[styles.appointmentStatus, item.status === 'Completed' ? styles.completed : styles.upcoming]}>
                {item.status}
              </Text>
            </View>
          ))}
        </View>
      ),
    },
    
    {
      id: 'buttons',
      render: () => (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleLogout(navigation)}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  return (
    <FlatList
      data={sections}
      renderItem={({ item }) => item.render()}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  appointmentDate: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  appointmentStatus: {
    fontSize: 14,
    marginTop: 5,
  },
  completed: {
    color: '#28a745',
  },
  upcoming: {
    color: '#ffc107',
  },
});

export default ProfileScreen;
