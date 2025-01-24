import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';

const GetStart = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.heroContainer}>
        <Image
          source={require('../assets/images/img-get-start.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Explore o Mundo</Text>
        <Text style={styles.description}>
          Capture momentos especiais e crie álbuns incríveis das suas viagens
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Começar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.registerButton]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[styles.buttonText, styles.registerButtonText]}>Registrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031F2B',
		alignItems: 'center',
		padding: 20,
  },
  heroContainer: {
		marginTop: 50,
  },
  contentContainer: {
    flex: 1,
   	marginTop: 30,
		alignItems: 'center',
		width: '100%',
  },
  title: {
    fontSize: 28,
		fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
		fontFamily: 'Poppins-Thin',
    color: '#ffffff',
    marginBottom: 30,
		textAlign: 'center',
  },
  buttonContainer: {
    gap: 15,
		flex: 1,
		width: '100%',
		justifyContent: 'flex-end',
  },
  button: {
    backgroundColor: '#5EDFFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
		width: '100%',
  },
  buttonText: {
    color: '#031F2B',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5EDFFF',
  },
  registerButtonText: {
    color: '#5EDFFF',
  }
});

export default GetStart;