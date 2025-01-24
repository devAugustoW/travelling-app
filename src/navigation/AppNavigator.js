import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GetStart from '../screens/GetStart.js';
import Register from '../screens/Register.js';
import Login from '../screens/Login.js';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GetStart" component={GetStart} />
				<Stack.Screen name="Register" component={Register} />
				<Stack.Screen name="Login" component={Login} />				
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;