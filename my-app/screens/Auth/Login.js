import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Image, Text } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';  
import { auth, firestore } from '../../firebaseConfig';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in:', user.uid);

      // Fetch user role from Firestore
      const userDocRef = doc(firestore, 'users', user.uid);  
      const userDoc = await getDoc(userDocRef);  

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData?.role || null;
        console.log('User role:', role);
        onLoginSuccess(role); // Pass role back to parent component
      } else {
        console.log('No user data found in Firestore.');
        onLoginSuccess(null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setIsLoading(false);
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

      <Text style={styles.title}>Login to Your Account</Text>

      {/* Login Form */}
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
      <Button title={isLoading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={isLoading} />

      {/* Redirect to Register */}
      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Don't have an account? Register here
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

export default Login;
