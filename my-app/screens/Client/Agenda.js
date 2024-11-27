import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';

// Example data - replace this with dynamic data (e.g., from Firebase or an API)
const exampleEvents = [
  { id: '1', title: 'Meeting with Dr. Smith', date: '2024-11-30', time: '10:00 AM' },
  { id: '2', title: 'Consultation for Checkup', date: '2024-12-01', time: '2:00 PM' },
  { id: '3', title: 'Follow-up with Dr. Lee', date: '2024-12-03', time: '11:00 AM' },
];

const AgendaScreen = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  // Fetch events (replace with Firebase or other data fetching logic)
  useEffect(() => {
    // Simulate fetching data
    const fetchEvents = async () => {
      // In a real-world scenario, this would be an API call or Firebase fetch
      setEvents(exampleEvents);
    };

    fetchEvents();
  }, []);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.eventItem}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDetails}>{item.date} at {item.time}</Text>
      </TouchableOpacity>
    );
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    // Optionally, you can filter events by selected date here
  };

  // Filter events based on the selected date
  const filteredEvents = events.filter(event => event.date === selectedDate);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Agenda</Text>

      {/* Calendar Component */}
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#28a745', selectedTextColor: '#fff' },
        }}
        monthFormat={'yyyy MM'}
      />

      {/* Event List */}
      <View style={styles.eventsContainer}>
        {selectedDate ? (
          <>
            <Text style={styles.subHeader}>Events on {selectedDate}:</Text>
            {filteredEvents.length > 0 ? (
              <FlatList
                data={filteredEvents}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.eventList}
              />
            ) : (
              <Text style={styles.noEventsText}>No events on this day.</Text>
            )}
          </>
        ) : (
          <Text style={styles.subHeader}>Select a date to view events</Text>
        )}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  eventList: {
    paddingBottom: 20,
  },
  eventsContainer: {
    flex: 1,
    marginTop: 20,
  },
  eventItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
    elevation: 2, // Adds shadow effect for Android
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  eventDetails: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  noEventsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default AgendaScreen;
