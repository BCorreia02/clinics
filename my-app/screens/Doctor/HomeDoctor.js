import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import moment from 'moment';

const HomeDoctor = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({ totalAppointments: 0, today: 0 });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'appointments'));
        const appointmentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const today = moment().format('YYYY-MM-DD');
        const todayAppointmentsList = appointmentsList.filter(
          (appointment) => appointment.date === today
        );

        setAppointments(appointmentsList);
        setTodayAppointments(todayAppointmentsList);

        // Update stats
        setStats({
          totalAppointments: appointmentsList.length,
          today: todayAppointmentsList.length,
        });
      } catch (error) {
        console.log('Erro ao buscar consultas:', error);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard do Médico</Text>

      {/* Statistics Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalAppointments}</Text>
          <Text style={styles.statLabel}>Total de Consultas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.today}</Text>
          <Text style={styles.statLabel}>Consultas Hoje</Text>
        </View>
      </View>

      {/* Appointments for Today */}
      <Text style={styles.sectionHeader}>Consultas de Hoje</Text>
      <FlatList
        data={todayAppointments}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.appointmentCard}
            onPress={() => navigation.navigate('PatientDetails', { patientId: item.patientId })}
          >
            <Text style={styles.text}>Paciente: {item.patientName}</Text>
            <Text style={styles.text}>Horário: {item.time}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.text}>Nenhuma consulta para hoje.</Text>}
      />

      {/* All Appointments */}
      <Text style={styles.sectionHeader}>Todas as Consultas</Text>
      <FlatList
        data={appointments}
        renderItem={({ item }) => (
          <View style={styles.appointmentCard}>
            <Text style={styles.text}>Paciente: {item.patientName}</Text>
            <Text style={styles.text}>Data: {item.date}</Text>
            <Text style={styles.text}>Horário: {item.time}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Agendar Consulta"
          onPress={() => navigation.navigate('ScheduleAppointment')}
        />
        <Button
          title="Cancelar Consulta"
          color="#d9534f"
          onPress={() => console.log('Função para cancelar consulta')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  appointmentCard: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  actionsContainer: {
    marginTop: 20,
  },
});

export default HomeDoctor;
