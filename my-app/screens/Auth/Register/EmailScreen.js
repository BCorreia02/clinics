import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { firestore } from '../../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const EmailScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return;
    }

    setIsLoading(true);
    try {
      // Query Firestore to check if the email exists in the 'users' collection
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Email exists -> Navigate to PasswordScreen
        navigation.navigate('Password', { email });
      } else {
        // Email does not exist -> Navigate to NameScreen
        navigation.navigate('Name', { email });
      }
    } catch (error) {
      Alert.alert('Error', `Error checking email: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        <Text style={styles.title}>What's your email address?</Text>
        <TextInput
            style={styles.input}
            value={email}
            placeholder="Email"
            placeholderTextColor="#aaa"
            onChangeText={setEmail}
            keyboardType="email-address"
        />
        <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonLoading]}
            onPress={handleNext}
            disabled={isLoading}
        >
            <Text style={styles.buttonText}>
            {isLoading ? 'Checking...' : 'Next'}
            </Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff', // White background
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000', // Black text
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#000', // Blue underline
    marginBottom: 40, // Spacing between input and button
  },
  button: {
    backgroundColor: '#000', // Blue button for the next action
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    width: '60%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonLoading: {
    backgroundColor: '#000', // Lighter blue when loading
  },
});

export default EmailScreen;
