import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../../firebaseConfig'; // Assuming you've set up Firebase
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; // Import signOut function

const ProfileScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [consultas, setConsultas] = useState([]);

  // Fetch user profile data and consultas on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const user = auth.currentUser;

        if (user) {
          // Fetch user profile data
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || 'John Doe');
            setUserEmail(userData.email || 'john.doe@example.com');
            setProfileImage(userData.profileImage || 'https://via.placeholder.com/100');
          }

          // Fetch consultas history
          const consultasDoc = await getDoc(doc(firestore, 'consultas', user.uid));
          if (consultasDoc.exists()) {
            const consultasData = consultasDoc.data().consultas || [];
            setConsultas(consultasData);
          }
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigation.navigate('Welcome'); // Navigate to the login screen after logout
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <Text style={styles.title}>{userName}</Text>
        <Text style={styles.subtitle}>{userEmail}</Text>
      </View>

      {/* Profile Edit Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('EditProfile')} // Navigate to EditProfile screen
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Consultas History Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appointment History</Text>
        <FlatList
          data={consultas}
          renderItem={({ item }) => (
            <View style={styles.consultaItem}>
              <Text style={styles.consultaTitle}>{item.title}</Text>
              <Text style={styles.consultaDate}>{item.date}</Text>
              <Text style={[styles.consultaStatus, item.status === 'Completed' ? styles.completed : styles.upcoming]}>
                {item.status}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      {/* Account Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ChangePassword')} // Navigate to ChangePassword screen
        >
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogout} // Logout handler when button is pressed
        >
          <Text style={styles.buttonText}>Log Out</Text>
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
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
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  consultaItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  consultaTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  consultaDate: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  consultaStatus: {
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
