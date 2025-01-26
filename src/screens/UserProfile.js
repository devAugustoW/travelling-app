import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserProfile = () => {
	return (
		<View style={styles.container}>
      <Text style={styles.text}>User Profile</Text>
    </View>
	)
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031F2B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
});

export default UserProfile;