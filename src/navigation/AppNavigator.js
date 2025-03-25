import React from 'react';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import GetStart from '../screens/GetStart';
import Register from '../screens/Register';
import Login from '../screens/Login';
import Home from '../screens/Home';
import CreateAlbum from '../screens/CreateAlbum';
import UserProfile from '../screens/UserProfile';
import Album from '../screens/Album';
import NewPhoto from '../screens/NewPhoto';
import InputPhotoLocation from '../screens/InputPhotoLocation';
import InputAlbumLocation from '../screens/inputAlbumLocation';
import Post from '../screens/Post';
import TripMap from '../screens/TripMap';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// Navegação bottom
const TabNavigator = () => {
	const [activeTab, setActiveTab] = useState('HomeTab');
	const navigation = useNavigation();

	// Funcionalidade de camera atualizada
	const openCamera = async () => {
		try {
			// solicita permissão para a câmera
			const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
			
			// solicita permissão para acessar a galeria
			const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
			
			if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
				Alert.alert(
					'Permissão necessária', 
					'Precisamos de acesso à câmera e à galeria para tirar e salvar fotos'
				);
				return;
			}
			
			// sbre a câmera 
			const result = await ImagePicker.launchCameraAsync({
				quality: 1,
				allowsEditing: false,
			});
			
			// se usuário tirou uma foto (não cancelou)
			if (!result.canceled && result.assets && result.assets.length > 0) {
				const photoUri = result.assets[0].uri;
				
				// salva a foto na galeria
				const asset = await MediaLibrary.createAssetAsync(photoUri);
				await MediaLibrary.createAlbumAsync('Travelling App', asset, false);
				
				// notifica o usuário que a foto foi salva
				Alert.alert('Sucesso', 'Foto salva na galeria com sucesso!');
			}

		} catch (error) {
			console.error('Erro ao tirar foto:', error);
			Alert.alert('Erro', 'Não foi possível tirar ou salvar a foto');
		}
	};

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
        component={Home} 
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
				<Stack.Screen name="InputAlbumLocation" component={InputAlbumLocation} />
				<Stack.Screen name="Post" component={Post}
					options={{
						headerShown: false
					}}
				/>
				<Stack.Screen name="TripMap" component={TripMap} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;