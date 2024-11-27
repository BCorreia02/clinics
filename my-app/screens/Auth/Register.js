import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Image, Text } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebaseConfig';

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleRegister = async () => {
    try {
      // Step 1: Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('User created successfully:', user.uid);

      // Step 2: Save user data to Firestore with the default role as "client"
      await setDoc(doc(firestore, 'users', user.uid), {
        name: name,
        email: email,
        role: 'client', // Default role
        profileImage: '', // Optional: Add a default profile image URL
      });

      console.log('User data saved to Firestore');
      // Step 3: Navigate to the Login screen after registration
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error during registration:', error.message);

      // Handle specific errors
      if (error.code === 'auth/email-already-in-use') {
        alert('This email is already in use.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Invalid email address.');
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Clinic Logo */}
      <Image 
        source={{ uri: 'https://via.placeholder.com/150x150' }} 
        style={styles.logo} 
        resizeMode="cover" 
      />

      <Text style={styles.title}>Create an Account</Text>

      {/* Registration Form */}
      <TextInput
        style={styles.input}
        value={name}
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        value={email}
        placeholder="Email"
        placeholderTextColor="#aaa"
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button title="Register" onPress={handleRegister} />

      {/* Redirect to Login */}
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? Log in
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 75, // Makes the image circular if it's a square
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e3b4e',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  link: {
    fontSize: 14,
    color: '#007bff',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});

export default Register;
