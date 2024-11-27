import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const Settings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <Button title="Update Profile" onPress={() => {/* Navigate to profile update */}} />
      <Button title="Change Password" onPress={() => {/* Navigate to password change */}} />
      <Button title="Log Out" onPress={() => {/* Logout logic */}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Settings;
