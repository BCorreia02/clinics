import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

const AppointmentDetails = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const appointmentRef = doc(firestore, 'appointments', appointmentId);
        const appointmentSnapshot = await getDoc(appointmentRef);

        if (appointmentSnapshot.exists()) {
          setAppointmentDetails({ id: appointmentId, ...appointmentSnapshot.data() });
        } else {
          console.log('Consulta não encontrada.');
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes da consulta:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!appointmentDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Detalhes da consulta não encontrados.</Text>
      </View>
    );
  }

  const { patientName, date, time, description, doctorNotes, status } = appointmentDetails;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detalhes da Consulta</Text>

      <View style={styles.detailCard}>
        <Text style={styles.label}>Paciente:</Text>
        <Text style={styles.value}>{patientName}</Text>

        <Text style={styles.label}>Data:</Text>
        <Text style={styles.value}>{date}</Text>

        <Text style={styles.label}>Horário:</Text>
        <Text style={styles.value}>{time}</Text>

        <Text style={styles.label}>Descrição:</Text>
        <Text style={styles.value}>{description}</Text>

        <Text style={styles.label}>Notas do Médico:</Text>
        <Text style={styles.value}>{doctorNotes || 'Nenhuma nota disponível.'}</Text>

        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{status || 'Não especificado'}</Text>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  detailCard: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AppointmentDetails;
