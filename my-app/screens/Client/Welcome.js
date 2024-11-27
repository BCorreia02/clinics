import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; // Ensure to import auth from your firebase configuration

const WelcomeScreen = ({ navigation }) => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Automatically set the user role here based on the user data
        navigation.navigate('RoleBasedNavigator');  // Navigate to role-based screen if logged in
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);  // Sign out the current user
      console.log('User logged out');
      navigation.navigate('Welcome');  // Navigate to the Welcome screen after logout
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://example.com/your-background-image.jpg' }} // Use a background image or a color
        style={styles.background}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Welcome to Clinicas</Text>
          <Text style={styles.subtitle}>Your health, our priority</Text>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[styles.buttonText, styles.registerButtonText]}>Register</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}  // Add custom style for the logout button
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for text contrast
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007BFF', // Blue button for login
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 5,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#28a745', // Green button for register
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545', // Red button for logout
  },
});

export default WelcomeScreen;
