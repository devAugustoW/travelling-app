import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';

export default function App() {

	const [fontsLoaded] = useFonts({
		'Poppins-ExtraLight': require('./src/assets/fonts/Poppins-ExtraLight.ttf'),
		'Poppins-Thin': require('./src/assets/fonts/Poppins-Thin.ttf'),
		'Poppins-Regular': require('./src/assets/fonts/Poppins-Regular.ttf'),
		'Poppins-Medium': require('./src/assets/fonts/Poppins-Medium.ttf'),
		'Poppins-SemiBold': require('./src/assets/fonts/Poppins-SemiBold.ttf'),
		'Poppins-Bold': require('./src/assets/fonts/Poppins-Bold.ttf'),
	});

	if (!fontsLoaded) {
		return null;
	}

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#031F2B" />
      <AppNavigator />
    </>
  );
}