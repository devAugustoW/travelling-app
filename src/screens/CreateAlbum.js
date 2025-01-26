import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CreateAlbum = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>CreateAlbum</Text>
    </View>
  );
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

export default CreateAlbum;