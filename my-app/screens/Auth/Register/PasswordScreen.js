import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, firestore } from '../../../firebaseConfig';

const PasswordScreen = ({ route, navigation }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { email, name } = route.params;

  const handleSubmit = async () => {
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Password is required');
      return;
    }

    setIsLoading(true);
    try {
      if (name) {
        // Register the user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user data in the "users" collection
        await setDoc(doc(firestore, 'users', user.uid), {
          name,
          email,
          role: 'client',
          profileImage: '',
        });

        // Save client-specific data in the "clients" collection
        await setDoc(doc(firestore, 'clients', user.uid), {
          userId: user.uid,
          name: name,
          specialty: email, // Change this field if "specialty" doesn't make sense here
          createdAt: new Date(),
        });
        navigation.navigate('RoleBasedNavigator'); // Replace with your role-based navigation
      } else {
        // Log the user in
        await signInWithEmailAndPassword(auth, email, password);
        navigation.navigate('RoleBasedNavigator'); // Replace with your role-based navigation
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {name ? 'Create a Password' : 'Enter Your Password'}
      </Text>
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonLoading]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? (name ? 'Registering...' : 'Logging in...') : (name ? 'Register' : 'Login')}
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
    textAlign: 'left',
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

export default PasswordScreen;
