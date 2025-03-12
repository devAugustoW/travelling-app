import React, { useState, useCallback, useEffect } from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, ScrollView, FlatList, Platform, Text, TouchableOpacity, Image, TextInput, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, CLOUD_UPLOAD_PRESET, CLOUD_NAME } from '@env';

const NewPhoto = ({ route, navigation }) => {
	const { albumId } = route.params || {};
	const [isLoading, setIsLoading] = useState(false);
	const [userId, setUserId] = useState(null);
	const [token, setToken] = useState(null);
	const [photoData, setPhotoData] = useState({
		image: null,
		title: '',
		description: '',
		nameLocation: '',
		location: {
			latitude: null,
			longitude: null
		},
		isCoverPhoto: false,
		albumId: albumId,
	});

	  // Recupera o ID do usuário do AsyncStorage
		useEffect(() => {
			const fetchUserId = async () => {
				try {
					// Buscar dados do usuário
					const userDataString = await AsyncStorage.getItem('@user_data');
					if (userDataString) {
						const userData = JSON.parse(userDataString);
						setUserId(userData._id); 
					}

					// Buscar token de autenticação
					const authToken = await AsyncStorage.getItem('@auth_token');
					if (authToken) {
						setToken(authToken);
					}

				} catch (error) {
					console.log('Erro ao buscar ID do usuário:', error);
				}
			};
	
			fetchUserId();
		}, []);

	// Função para atualizar campos específicos
	const updatePhotoData = useCallback((field, value) => {
		setPhotoData((prev) => ({ ...prev, [field]: value }));
	}, []);

	// Função para carregar as fotos da galeria
	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: false,
			quality: 1,
		});

		if (!result.canceled) {
			updatePhotoData('image', result.assets[0].uri);
		}
	};

	// Função para abrir a câmera
	const openCamera = () => {
		ImagePicker.launchCameraAsync({ mediaType: 'photo' })
			.then((response) => {
				if (!response.canceled) {
					updatePhotoData('image', response.assets[0].uri);
				}
			});
	};

	// Função upload Cloudinary
	const uploadImageToCloudinary = async (imageUri) => {
		const data = new FormData();
		data.append('file', {
			uri: imageUri,
			type: 'image/jpeg', 
			name: 'upload.jpg', 
		});
		data.append('upload_preset', CLOUD_UPLOAD_PRESET); 
		data.append('cloud_name', CLOUD_NAME); 

		try {
			const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
	
			const result = response.data;
			return result; 

		} catch (error) {
			console.error('Erro ao fazer upload da imagem:', error);
			throw error;
		}
	};

	// Função para salvar a foto
	const handleSavePhoto = async () => {
		setIsLoading(true);
		try {
			// Validação básica
			if (!photoData.image) {
				Alert.alert('Erro', 'Selecione uma imagem');
				return;
			}
			if (!photoData.title) {
				Alert.alert('Erro', 'Adicione um título para a foto');
				return;
			}

			// Cloudinary -> Upload e extrair
			const cloudinaryResponse = await uploadImageToCloudinary(photoData.image);
			const imageUrl = cloudinaryResponse.secure_url;

			// Preparar os dados para envio
      const postData = {
        imagem: imageUrl,
        title: photoData.title,
        description: photoData.description,
        nota: 0, 
        cover: photoData.isCoverPhoto,
        nameLocation: photoData.nameLocation,
        location: {
          latitude: photoData.location.latitude,
          longitude: photoData.location.longitude,
        },
        userId: userId,
        albumId: photoData.albumId,
      };

			// Enviar para a API com o token de autenticação
			const response = await axios.post(
				`${API_URL}/posts`, 
				postData,
				{
					headers: {
						'Authorization': `Bearer ${token}`
					}
				}
			);

			// Mensagem de sucesso, limpar campos e navegar para Album
			Alert.alert(
				'Sucesso',
				'Foto salva com sucesso!',
				[
					{
						text: 'OK',
						onPress: () => {
							// Limpar os campos do formulário
							setPhotoData({
								image: null,
								title: '',
								description: '',
								nameLocation: '',
								location: {
									latitude: null,
									longitude: null
								},
								isCoverPhoto: false,
								albumId: albumId,
							});
							
							// Navegar de volta para a tela do álbum
							navigation.navigate('Album', { albumId: photoData.albumId });
						}
					}
				]
			);


		} catch (error) {
			console.error('Erro ao salvar foto:', error);
			Alert.alert('Erro', 'Não foi possível salvar a foto');
		} finally {
			setIsLoading(false);
		}
	};

	// Navegar para InputPhotoLocation e definir updatePhotoData
	const navigateToInputPhotoLocation = () => {
		navigation.navigate('InputPhotoLocation', { updatePhotoData });
	};


	return (
		<SafeAreaView style={styles.container}>
			{/* Header de New Photo */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Feather name="x" size={24} color="#FFF" />
				</TouchableOpacity>
				<Text style={styles.title}>Nova Foto</Text>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
			>
				<ScrollView style={styles.scrollContainer}>
					{/* Área de preview da foto */}
					<View style={styles.imagePreview}>
						{photoData.image ? (
							<Image source={{ uri: photoData.image }} style={styles.image} />
						) : (
							<Text style={styles.placeholder}>Nenhuma foto selecionada</Text>
						)}
					</View>

					{/* Botões de seleção de foto */}
					<View style={styles.buttonsContainer}>
						<TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
							<Text style={styles.buttonText}>Galeria de imagens</Text>
						</TouchableOpacity>

						<TouchableOpacity onPress={openCamera} style={styles.cameraButton}>
							<Feather name="camera" size={20} color="#FFF" />
						</TouchableOpacity>
					</View>

					{/* Botão para adicionar localização */}
					<TouchableOpacity
						style={styles.locationButton}
						onPress={navigateToInputPhotoLocation}
					>
						<Text style={styles.buttonText}>
              {photoData.nameLocation || 'Selecionar Localização'}
            </Text>
						<Feather name="chevron-right" size={18} color="#FFF" />
					</TouchableOpacity>

					{/* Dados da foto */}
					<View style={styles.formContainer}>
						{/* Título da foto */}
						<Text style={styles.formLabel}>Título para foto</Text>
						<TextInput
							style={styles.titleInput}
							placeholder="Adicione um título..."
							placeholderTextColor="#667"
							value={photoData.title}
							onChangeText={(text) => updatePhotoData('title', text)}
						/>

						{/* Legenda da foto */}
						<Text style={styles.formLabel}>Adicione uma legenda...</Text>
						<TextInput
							style={styles.descriptionInput}
							placeholder="Adicione uma legenda..."
							placeholderTextColor="#667"
							multiline
							value={photoData.description}
							onChangeText={(text) => updatePhotoData('description', text)}
						/>

						{/* Seção definir capa do álbum */}
						<View style={styles.albumCoverContainer}>
							<Text style={styles.formLabel}>Capa do Álbum</Text>
							<View style={styles.checkboxContainer}>
								<TouchableOpacity
									style={styles.checkboxWrapper}
									onPress={() => updatePhotoData('isCoverPhoto', true)}
								>
									<View style={[styles.checkbox, photoData.isCoverPhoto && styles.checkboxSelected]}>
										{photoData.isCoverPhoto && <Feather name="check" size={14} color="#031F2B" />}
									</View>
									<Text style={styles.checkboxLabel}>Sim</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={styles.checkboxWrapper}
									onPress={() => updatePhotoData('isCoverPhoto', false)}
								>
									<View style={[styles.checkbox, !photoData.isCoverPhoto && styles.checkboxSelected]}>
										{!photoData.isCoverPhoto && <Feather name="check" size={14} color="#031F2B" />}
									</View>
									<Text style={styles.checkboxLabel}>Não</Text>
								</TouchableOpacity>
							</View>
						</View>

						<View style={styles.actionButtons}>
							<TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
								<Text style={styles.cancelButtonText}>Cancelar</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.saveButton} onPress={handleSavePhoto}>
								<Text style={styles.saveButtonText}>Salvar</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
		backgroundColor: '#031F2B',
	},
	scrollContainer:{},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingBottom: 10,
		paddingHorizontal: 10,
	},
	title: {
		color: '#FFF',
		fontSize: 18,
		fontFamily: 'Poppins-Bold',
		marginLeft: -120,
	},
	imagePreview: {
		width: '100%',
		height: 450,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#333',
		borderRadius: 30,
		marginHorizontal: 'auto',
	},
	image: {
		width: '100%',
		height: '100%',
		borderRadius: 30,
	},
	placeholder: {
		color: '#FFF',
	},
	buttonsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingTop: 30,
		paddingBottom: 20,
	},
	galleryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#263238',
		borderWidth: 1,
		borderColor: '#5EDFFF',
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 8,
	},
	cameraButton: {
		backgroundColor: '#5EDFFF',
		padding: 10,
		borderRadius: 8,
	},
	buttonText: {
		color: '#FFF',
		marginRight: 5,
	},
	locationButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderWidth: 1,
		borderColor: '#5EDFFF',
		backgroundColor: '#263238',
		paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
	formLabel: {
		color: '#FFF',
		fontSize: 16,
		fontFamily: 'Poppins-Regular',
		marginBottom: -5,
	},
	titleInput: {
		borderBottomWidth: 1,
		borderBottomColor: '#5EDFFF',
		color: '#5EDFFF',
		fontSize: 18,
		fontFamily: 'Poppins-Regular',
		paddingBottom: 0,
		marginBottom: 35,
	},
	descriptionInput: {
		borderBottomWidth: 1,
		borderBottomColor: '#5EDFFF',
		color: '#5EDFFF',
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
		textAlignVertical: 'top',
		paddingBottom: 0,
		marginBottom: 35,
	},
	albumCoverContainer: {},
	checkboxContainer: {
		flexDirection: 'row',
		marginTop: 10,
		marginBottom: 20,
	},
	checkboxWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 17
	},
	checkbox: {
		width: 20,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#5EDFFF',
		borderRadius: 4,
		marginRight: 8,
	},
	checkboxSelected: {
		backgroundColor: '#5EDFFF',
	},
	checkboxLabel: {
		color: '#FFF',
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
	},
	actionButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
	cancelButton: {
		borderWidth: 1,
		borderColor: '#5EDFFF',
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 20,
		width: '48%',
		alignItems: 'center',
	},
	cancelButtonText: {
		color: '#FFF',
		fontSize: 16,
		fontFamily: 'Poppins-Regular',
	},
	saveButton: {
		backgroundColor: '#5EDFFF',
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 20,
		width: '48%',
		alignItems: 'center',
	},
	saveButtonText: {
		color: '#031F2B',
		fontSize: 16,
		fontFamily: 'Poppins-SemiBold',
	},
});

export default NewPhoto;