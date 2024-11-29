import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native'; // Import Lottie

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/loading-animation.json')} // Animation file from LottieFiles
        autoPlay
        loop
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Background color of the loading screen
  },
});

export default LoadingScreen;
