import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
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
      let user;
      if (name) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
  
        await setDoc(doc(firestore, 'users', user.uid), {
          name,
          email,
          role: 'client',
          profileImage: '',
        });
  
        const clientId = doc(firestore, 'clients').id;
  
        await setDoc(doc(firestore, 'clients', clientId), {
          userId: user.uid,
          name: name,
          createdAt: new Date(),
        });
  
        navigation.navigate('RoleBasedNavigator');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigation.navigate('RoleBasedNavigator');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'left',
  },
  input: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#000',
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
    backgroundColor: '#000',
  },
});

export default PasswordScreen;