import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dummy data for rewards and referrals
const referralData = {
  totalReferred: 5,
  totalRewards: 200,
  rewardHistory: [
    { id: 1, reward: 50, date: '2024-11-01' },
    { id: 2, reward: 150, date: '2024-11-10' },
  ],
  referralCode: 'ABC123XYZ',
};

const RewardsScreen = ({ navigation }) => {
  // Function to share referral code
  const onShare = async () => {
    try {
      await Share.share({
        message: `Use my referral code to get a discount: ${referralData.referralCode}`,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Referral Rewards</Text>
        <Text style={styles.subtitle}>Earn rewards for referring friends!</Text>
      </View>

      {/* Referral Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Referral Overview</Text>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewText}>Total Referrals: {referralData.totalReferred}</Text>
          <Text style={styles.overviewText}>Total Rewards: ${referralData.totalRewards}</Text>
        </View>
      </View>

      {/* Referral Code */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Referral Code</Text>
        <View style={styles.referralCodeCard}>
          <Text style={styles.referralCode}>{referralData.referralCode}</Text>
          <TouchableOpacity style={styles.button} onPress={onShare}>
            <Text style={styles.buttonText}>Share Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rewards History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rewards History</Text>
        {referralData.rewardHistory.map((reward) => (
          <View key={reward.id} style={styles.rewardCard}>
            <Text style={styles.rewardText}>Reward: ${reward.reward}</Text>
            <Text style={styles.rewardDate}>Date: {reward.date}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e3b4e',
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e3b4e',
    marginBottom: 10,
  },
  overviewCard: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  referralCodeCard: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  referralCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rewardCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rewardText: {
    fontSize: 16,
    color: '#333',
  },
  rewardDate: {
    fontSize: 14,
    color: '#6c757d',
  },
});

export default RewardsScreen;
