import React from 'react';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import * as Camera from 'expo-camera';
import GetStart from '../screens/GetStart';
import Register from '../screens/Register';
import Login from '../screens/Login';
import Home from '../screens/Home';
import CreateAlbum from '../screens/CreateAlbum';
import UserProfile from '../screens/UserProfile';
import Album from '../screens/Album';
import NewPhoto from '../screens/NewPhoto';
import InputPhotoLocation from '../screens/InputPhotoLocation';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// navegação bottom
const TabNavigator = () => {
	const [activeTab, setActiveTab] = useState('HomeTab');
	const navigation = useNavigation();

	// funcionalidade de camera
	const openCamera = async () => {
		const { status } = await Camera.requestCameraPermissionsAsync();

		if (status === 'granted') {
			// Abre a câmera nativa
      await Camera.launchCameraAsync({
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
      })
      .then(result => {
        if (!result.canceled) {
          
          console.log('Foto tirada:', result.assets[0].uri);
          
        }
      })
      .catch(error => {
        console.log('Erro ao tirar foto:', error);
        Alert.alert('Erro', 'Não foi possível tirar a foto');
      });

		}	else {
      Alert.alert(
        'Permissão necessária', 
        'Precisamos de acesso à câmera para tirar fotos'
      );
    }
	}

	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: '#263238',
					borderTopWidth: 0,
					height: 60,
					paddingBottom: 8,
					paddingTop: 8,
					borderTopLeftRadius: 30,
					borderTopRightRadius: 30,
					position: 'absolute', 
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 0,
				},
				tabBarActiveTintColor: '#5EDFFF',
				tabBarInactiveTintColor: '#664',
				elevation: 0, // remove sombra no Android
				shadowOpacity: 0, // remove sombra no iOS
			}}
		>
			<Tab.Screen 
        name="HomeTab" 
        component={Home}
        options={{
          tabBarIcon: ({ }) => (
            <Feather 
							name="home" 
							size={30} 
							color={activeTab === 'HomeTab' ? '#5EDFFF' : '#B1AEAE'} />
          ),
          tabBarLabel: '',
        }}
				listeners={{
          tabPress: () => setActiveTab('HomeTab'),
        }}
      />
			<Tab.Screen 
        name="Camera" 
        component={Home} // componente Home é simbólico
        options={{
          tabBarIcon: ({ }) => (
            <Feather 
							name="camera" 
							size={30} 
							color={'#B1AEAE'} 
						/>
          ),
          tabBarLabel: '',
        }}
        listeners={{
          tabPress: (e) => {
            // previne a navegação padrão
            e.preventDefault();
            openCamera();
          },
        }}
      />

			<Tab.Screen 
        name="CreateAlbumTab" 
        component={Home}
        options={{
          tabBarIcon: ({ }) => (
            <Feather 
							name="folder-plus" 
							size={30} 
							color={activeTab === 'CreateAlbum' ? '#5EDFFF' : '#B1AEAE'} />
          ),
          tabBarLabel: '',
        }}
				listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CreateAlbum');
          },
        }}
      />

			<Tab.Screen 
        name="UserProfile" 
        component={UserProfile}
        options={{
          tabBarIcon: ({ }) => (
            <Feather 
							name="user" 
							size={30} 
							color={activeTab === 'UserProfile' ? '#5EDFFF' : '#B1AEAE'} />
          ),
          tabBarLabel: '',
        }}
				listeners={{
          tabPress: () => setActiveTab('UserProfile'),
        }}
			/>
		</Tab.Navigator>
	);
};

// navegação stack
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name="GetStart" component={GetStart} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen 
          name="CreateAlbum" 
          component={CreateAlbum}
          options={{
            presentation: 'fullScreenModal'
          }}
        />
				<Stack.Screen name="Album" component={Album} />
				<Stack.Screen name="NewPhoto" component={NewPhoto} />
				<Stack.Screen name="InputPhotoLocation" component={InputPhotoLocation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;