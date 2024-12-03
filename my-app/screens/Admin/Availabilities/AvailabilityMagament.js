import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig'; // Assuming firebase is initialized in firebase.js
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

const AvailabilityMagament = () => {
  const navigation = useNavigation(); // Use the navigation hook
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null); // Add a state for specialtyId

  // Fetch specialties and doctors on component mount
  useEffect(() => {
    const fetchSpecialtiesAndDoctors = async () => {
      try {
        // Fetch specialties from the 'specialties' collection
        const specialtiesSnapshot = await getDocs(collection(firestore, 'specialties'));
        const specialtiesList = specialtiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSpecialties(specialtiesList);
      } catch (error) {
        console.error('Error fetching specialties:', error);
        Alert.alert('Error', 'Failed to fetch specialties');
      }
    };

    fetchSpecialtiesAndDoctors();
  }, []);

  // Fetch doctors based on selected specialtyId
  useEffect(() => {
    if (selectedSpecialtyId) {
      const fetchDoctorsBySpecialtyId = async () => {
        try {
          const doctorsQuery = query(
            collection(firestore, 'doctors'),
            where('specialtyId', '==', selectedSpecialtyId) // Filter doctors by specialtyId
          );
          const querySnapshot = await getDocs(doctorsQuery);
          const doctorsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setDoctors(doctorsList);
        } catch (error) {
          console.error('Error fetching doctors:', error);
          Alert.alert('Error', 'Failed to fetch doctors for the selected specialty');
        }
      };

      fetchDoctorsBySpecialtyId();
    }
  }, [selectedSpecialtyId]);

  const handleDefineAvailability = () => {
    if (!selectedDoctor || !selectedSpecialty) {
      Alert.alert('Error', 'Please select both a doctor and a specialty');
      return;
    }

    // Navigate to CreateAvailability screen and pass the selected data
    navigation.navigate('CreateAvailability', {
      selectedDoctor: selectedDoctor, // Pass the entire doctor object
      selectedSpecialty: selectedSpecialty,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Specialty and Doctor</Text>

      <Text>Select Specialty:</Text>
      <Picker
        selectedValue={selectedSpecialty}
        onValueChange={(itemValue) => {
          setSelectedSpecialty(itemValue);
          const specialtyId = specialties.find(specialty => specialty.name === itemValue)?.id;
          setSelectedSpecialtyId(specialtyId); // Update specialtyId based on selected specialty
        }}
      >
        {specialties.length > 0 ? (
          specialties.map((specialty) => (
            <Picker.Item label={specialty.name} value={specialty.name} key={specialty.id} />
          ))
        ) : (
          <Picker.Item label="No specialties available" value={null} />
        )}
      </Picker>

      <Text>Select Doctor:</Text>
      <Picker
        selectedValue={selectedDoctor}
        onValueChange={(itemValue) => setSelectedDoctor(itemValue)}
      >
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <Picker.Item label={doctor.name} value={doctor} key={doctor.id} />
          ))
        ) : (
          <Picker.Item label="No doctors available for this specialty" value={null} />
        )}
      </Picker>

      <Button title="Define Availabilities" onPress={handleDefineAvailability} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default AvailabilityMagament;
