import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TextInput, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { firestore } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const AdminDashboard = ({ navigation, handleLogout }) => {
  const [clinicData, setClinicData] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  // Fetch Clinic Data
  useEffect(() => {
    const fetchClinicData = async () => {
      setLoadingClinics(true);
      try {
        const querySnapshot = await getDocs(collection(firestore, 'clinics'));
        const data = querySnapshot.docs.map(doc => doc.data());
        setClinicData(data);
      } catch (error) {
        console.log('Error fetching clinic data:', error);
      } finally {
        setLoadingClinics(false);
      }
    };

    fetchClinicData();
  }, []);

  // Function to update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await firestore.collection('appointments').doc(appointmentId).update({
        status: newStatus,
      });
      Alert.alert('Success', 'Appointment status updated');
    } catch (error) {
      console.error('Error updating appointment:', error);
      Alert.alert('Error', 'Failed to update appointment');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subHeader}>Clinic Data</Text>
      {loadingClinics ? (
        <ActivityIndicator size="large" color="#00bcd4" />
      ) : clinicData.length > 0 ? (
        <FlatList
          data={clinicData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.clinicCard}>
              <Text style={styles.cardTitle}>Doctor: {item.doctor_name}</Text>
              <Text style={styles.cardTitle}>Client: {item.client_name}</Text>
              <Text>Date: {item.date} | Time: {item.time}</Text>
              <Text>Status: {item.status}</Text>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={() => updateAppointmentStatus(item.id, 'confirmed')}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => updateAppointmentStatus(item.id, 'cancelled')}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text>No clinic data available</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.settingsButton]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.buttonText}>Go to Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={() => handleLogout(navigation)}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  clinicCard: {
    marginVertical: 15,
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#e0f7fa',
    borderColor: '#00bcd4',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#00796b',
  },
  buttonContainer: {
    marginTop: 30,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '60%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  settingsButton: {
    backgroundColor: '#000',
  },
  logoutButton: {
    backgroundColor: '#000',
  },
});

export default AdminDashboard;
