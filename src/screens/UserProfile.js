import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { 
	View, 
	Text, 
	StyleSheet, 
	Image, 
	TextInput, 
	TouchableOpacity, 
	SafeAreaView, 
	ScrollView, 
	Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, CLOUD_NAME, CLOUD_UPLOAD_PRESET } from '@env';

const UserProfile = () => {
	const navigation = useNavigation();
	const [userData, setUserData] = useState({
		name: '',
		email: '',
		password: '',
		newPassword: '',
	});

	// dados de estatísticas
	const [userStats, setUserStats] = useState({
		albumCount: 0,
		photoCount: 0,
		totalCost: 0,
		formattedTotalCost: '0K'
	});

	// loading
	const [loading, setLoading] = useState(false);
	
	// resgata os dados do usuário
	useEffect(() => {
		loadUserData();
		fetchUserStats();
	}, []);

	// resgata os dados no AsyncStorage
	const loadUserData = async () => {
		try {
			const userDataString = await AsyncStorage.getItem('@user_data');
			if (userDataString) {
				const userData = JSON.parse(userDataString);
				setUserData(prevState => ({
					...prevState,
					name: userData.name,
					email: userData.email
				}));
			}
		} catch (error) {
			console.log('Erro ao carregar dados do usuário:', error);
		}
	};

	// atualiza os dados do usuário
	const handleUpdate = async () => {
		try {
			setLoading(true);

			// pega o token do AsyncStorage
			const token = await AsyncStorage.getItem('@auth_token');
			const userDataString = await AsyncStorage.getItem('@user_data');
			const storedUserData = JSON.parse(userDataString);
			const userId = storedUserData._id;


			if (!token || !userId) {
				Alert.alert('Erro', 'Você precisa estar logado');
				return;
			}

			// prepara os dados para atualização
			const updateData = {};

			// adiciona nome se foi alterado
			if (userData.name && userData.name !== storedUserData.name) {
				updateData.name = userData.name;
			}

			// adiciona senhas se foram preenchidas
			if (userData.newPassword) {
				if (!userData.currentPassword) {
					Alert.alert('Erro', 'Senha atual é necessária para alterar a senha');
					return;
				}
				updateData.oldPassword = userData.currentPassword;
				updateData.password = userData.newPassword;
			}

			// se não há dados para atualizar
			if (Object.keys(updateData).length === 0) {
				Alert.alert('Aviso', 'Nenhuma alteração para salvar');
				return;
			}

			// requisição de atualização
			const response = await axios.put(
				`${API_URL}/user/${userId}`,
				updateData,
				{
					headers: {
						'Authorization': `Bearer ${token}`
					}
				}
			);

			const updatedUserData = response.data.user;
			await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUserData));

			// limpa os campos de senha
			setUserData(prev => ({
				...prev,
				name: updatedUserData.name,
				email: updatedUserData.email,
				currentPassword: '',
				newPassword: ''
			}));

			// navegar para Home
			navigation.reset({
				index: 0,
				routes: [{ name: 'Home' }],
			});

		} catch (error) {
			console.error('Erro ao atualizar usuário:', error);

		} finally {
			setLoading(false);
		}
	};

	// Função para selecionar imagem de perfil
	const pickImage = async () => {
		try {
			// permissão para acessar a galeria
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (status !== 'granted') {
				Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
				return;
			}

			// seletor de imagem
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.5,
			});

			if (!result.canceled && result.assets && result.assets[0]) {
				setLoading(true);

				// prepara imagem para upload no Cloudinary
				const localUri = result.assets[0].uri;
				const filename = localUri.split('/').pop();

				// cria um FormData para o upload da imagem no Cloudinary
				const formData = new FormData();
				formData.append('file', {
					uri: localUri,
					type: 'image/jpeg',
					name: 'profile-image.jpg',
				});

				// variável de ambiente para o preset
				formData.append('upload_preset', CLOUD_UPLOAD_PRESET);
				formData.append('cloud_name', CLOUD_NAME);

				// upload para o Cloudinary
				const cloudinaryResponse = await fetch(
					`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
					{
						method: 'POST',
						body: formData,
						headers: {
							'content-type': 'multipart/form-data',
						},
					}
				);

				// logs para debug
				if (!cloudinaryResponse.ok) {
					console.log("Falha na resposta:", await cloudinaryResponse.text());
					throw new Error('Erro na resposta do Cloudinary');
				}

				// pega os dados do Cloudinary
				const cloudinaryData = await cloudinaryResponse.json();

				// validação da URL
				if (!cloudinaryData.secure_url) {
					throw new Error('Falha ao fazer upload da imagem para o Cloudinary');
				}

				// URL da imagem retornada pelo Cloudinary
				const imageUrl = cloudinaryData.secure_url;

				// busca token
				const token = await AsyncStorage.getItem('@auth_token');

				// envia a URL para a API
				const response = await axios.patch(
					`${API_URL}/user/profile-image`,
					{ userImg: imageUrl },
					{ headers: { 'Authorization': `Bearer ${token}` } }
				);

				// atualiza dados do usuário no AsyncStorage
				await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));

				// atualiza estado local
				setUserData(prevState => ({
					...prevState,
					userImg: response.data.user.userImg
				}));

				Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
			}

		} catch (error) {
			console.error('Erro ao atualizar foto de perfil:', error);
			Alert.alert('Erro', 'Não foi possível atualizar sua foto de perfil.');

		} finally {
			setLoading(false);

		}
	};

	// Função para buscar estatísticas
	const fetchUserStats = async () => {
		try {
			const token = await AsyncStorage.getItem('@auth_token');
			
			if (!token) {
				console.log('Token não encontrado');
				return;
			}
			
			const response = await axios.get(`${API_URL}/user/stats`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			
			setUserStats(response.data);
		} catch (error) {
			console.error('Erro ao buscar estatísticas:', error);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<Text style={styles.title}>Editar Perfil</Text>

				{/* Container da imagem de perfil */}
				<View style={styles.profileImageContainer}>
					<Image
						source={userData.userImg
							? { uri: userData.userImg }
							: require('../assets/images/profile.jpg')}
						style={styles.profileImage}
					/>
					<TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
						<FontAwesome name="camera" size={20} color="#FFF" />
					</TouchableOpacity>
				</View>

				{/* Nome e email do usuário */}
				<Text style={styles.userName}>{userData.name}</Text>
				<Text style={styles.userEmail}>{userData.email}</Text>

				{/* Container de estatísticas */}
				<View style={styles.statsContainer}>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>{userStats.albumCount}</Text>
						<Text style={styles.statLabel}>Álbuns</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>{userStats.photoCount}</Text>
						<Text style={styles.statLabel}>Total de Fotos</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>{userStats.formattedTotalCost}</Text>
						<Text style={styles.statLabel}>Investido</Text>
					</View>
				</View>

				<View style={styles.formContainer}>
					<Text style={styles.label}>Nome</Text>
					<TextInput
						style={styles.input}
						value={userData.name}
						onChangeText={(text) => setUserData({ ...userData, name: text })}
						placeholderTextColor="#fff"
					/>

					<Text style={styles.label}>Email</Text>
					<TextInput
						style={styles.input}
						value={userData.email}
						editable={false}
						placeholderTextColor="#fff"
					/>

					<Text style={styles.label}>Senha Corrente</Text>
					<TextInput
						style={styles.input}
						value={userData.currentPassword}
						onChangeText={(text) => setUserData({ ...userData, currentPassword: text })}
						secureTextEntry
						placeholderTextColor="#fff"
					/>

					<Text style={styles.label}>Nova Senha</Text>
					<TextInput
						style={styles.input}
						value={userData.newPassword}
						onChangeText={(text) => setUserData({ ...userData, newPassword: text })}
						secureTextEntry
						placeholderTextColor="#fff"
					/>

					<TouchableOpacity
						style={[styles.saveButton, loading && styles.saveButtonDisabled]}
						onPress={handleUpdate}
						disabled={loading}
					>
						<Text style={styles.saveButtonText}>
							{loading ? 'Salvando...' : 'Salvar'}
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#031F2B',
		padding: 20,
	},
	title: {
		color: '#FFF',
		fontSize: 24,
		fontFamily: 'Poppins-SemiBold',
		textAlign: 'center',
		marginBottom: 10,
	},
	profileImageContainer: {
		alignItems: 'center',
		marginBottom: 10,
		position: 'relative',
	},
	profileImage: {
		width: 150,
		height: 150,
		borderRadius: 100,
		backgroundColor: '#5EDFFF',
	},
	cameraButton: {
		position: 'absolute',
		right: '25%',
		bottom: 0,
		backgroundColor: '#5EDFFF',
		padding: 8,
		borderRadius: 20,
	},
	userName: {
		color: '#FFF',
		fontSize: 20,
		fontFamily: 'Poppins-SemiBold',
		textAlign: 'center',
	},
	userEmail: {
		color: '#666',
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
		textAlign: 'center',
		marginBottom: 10,
	},
	statsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 20,
	},
	statItem: {
		alignItems: 'center',
	},
	statNumber: {
		color: '#5EDFFF',
		fontSize: 34,
		fontFamily: 'Poppins-Bold',
	},
	statLabel: {
		color: '#FFF',
		fontSize: 12,
		fontFamily: 'Poppins-Regular',
		marginTop: -10,
	},
	formContainer: {
		flex: 1,
	},
	label: {
		color: '#FFF',
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
		marginBottom: 5,
	},
	input: {
		backgroundColor: '#263238',
		borderRadius: 8,
		padding: 12,
		marginBottom: 15,
		color: '#FFF',
		fontFamily: 'Poppins-Regular',
		borderColor: '#5EDFFF',
		borderWidth: 1,
	},
	saveButton: {
		backgroundColor: '#5EDFFF',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 20,
		marginBottom: 60,
	},
	saveButtonText: {
		color: '#031F2B',
		fontSize: 16,
		fontFamily: 'Poppins-SemiBold',
	},
	saveButtonDisabled: {
		opacity: 0.7,
	},

});

export default UserProfile;