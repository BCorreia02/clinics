import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

const TestScreen = () => {
  useEffect(() => {
    const runTest = async () => {
      try {
        await setDoc(doc(firestore, 'test', 'testDoc'), { message: 'Firestore works!' });
        console.log('Test document written successfully');
      } catch (error) {
        console.error('Firestore test failed:', error.message);
      }
    };

    runTest(); // Run the Firestore test on component mount
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Running Firestore Test...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});

export default TestScreen;
