import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Image,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Alert,
	Modal,
	useWindowDimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EditPostModal from '../components/EditPostModal';
import RatingModal from '../components/RatingModal';
import FontAwesome from '@expo/vector-icons/FontAwesome';


const Post = ({ route, navigation }) => {
	const { postId, albumId } = route.params;
	const windowWidth = useWindowDimensions().width;
	const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

	const [postData, setPostData] = useState({
		id: null,
		title: '',
		description: '',
		cover: false,
		grade: 0,
		nameLocation: '',
		location: null,
		imagem: '',
		createdAt: null
	});

	// Estados de visibilidade de modais
	const [isTitleModalVisible, setTitleModalVisible] = useState(false);
	const [isDescriptionModalVisible, setDescriptionModalVisible] = useState(false);
	const [isRatingModalVisible, setRatingModalVisible] = useState(false);
	const [isLocationModalVisible, setLocationModalVisible] = useState(false);

	// Estados de edição
	const [editableTitle, setEditableTitle] = useState('');
	const [editableDescription, setEditableDescription] = useState('');

	// Estado de carregamento
	const [loading, setLoading] = useState(true);

	// carrega os dados do Post
	useEffect(() => {
		fetchPost();
	}, []);

	// calcula dimensões da imagem
	useEffect(() => {
		if (postData.imagem) {
			Image.getSize(postData.imagem, (width, height) => {
				// altura proporcional com base na largura disponível
				const screenWidth = windowWidth - 20; // padding
				const scaleFactor = screenWidth / width;
				const calculatedHeight = height * scaleFactor;

				// mínimo e máximo para a altura
				const finalHeight = Math.min(Math.max(calculatedHeight, 350), 700);

				setImageSize({
					width: screenWidth,
					height: finalHeight
				});
			}, error => console.log('Erro ao obter tamanho da imagem:', error));
		}
	}, [postData.imagem, windowWidth]);

	// função para buscar os dados do Post
	const fetchPost = async () => {
		try {
			// busca token no AsyncStorage
			const token = await AsyncStorage.getItem('@auth_token');

			// busca dados do post
			const response = await axios.get(`${API_URL}/posts/${postId}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});

			// atualiza o estado postData
			setPostData({
				id: response.data.id,
				title: response.data.title || '',
				description: response.data.description || '',
				cover: response.data.cover || false,
				grade: response.data.grade || 0,
				nameLocation: response.data.nameLocation || '',
				location: response.data.location || null,
				imagem: response.data.imagem || '',
				createdAt: response.data.createdAt || new Date().toISOString()
			});

			// atualiza os estados editáveis
			setEditableTitle(response.data.title || '');
			setEditableDescription(response.data.description || '');

		} catch (error) {
			console.error('Erro ao buscar post:', error);
			Alert.alert('Erro', 'Não foi possível carregar os dados do post');

		} finally {
			setLoading(false);
		}
	};

	// função para salvar Edição
	const handleEditSave = async () => {
		try {
			// busca o token no AsyncStorage
			const token = await AsyncStorage.getItem('@auth_token');

			// atualiza o post
			await axios.patch(`${API_URL}/posts/${postId}`, {
				title: postData.title,
				description: postData.description,
				cover: postData.cover,
				grade: postData.grade,
				nameLocation: postData.nameLocation,
				location: postData.location
			}, {
				headers: { 'Authorization': `Bearer ${token}` }
			});

			// exibe mensagem de sucesso
			Alert.alert('Sucesso', 'Post atualizado com sucesso');
			navigation.goBack();

		} catch (error) {
			console.error('Erro ao atualizar post:', error);
			Alert.alert('Erro', `Não foi possível atualizar o post: ${error}`);
		}
	};

	// função deletar post
	const handleDeletePost = async () => {
		// modal de confirmação de exclusão
		Alert.alert(
			'Confirmar exclusão',
			'Tem certeza que deseja excluir este post?',

			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir', style: 'destructive',
					// função para excluir post
					onPress: async () => {
						try {
							// busca o token no AsyncStorage
							const token = await AsyncStorage.getItem('@auth_token');

							// deleta o post
							await axios.delete(`${API_URL}/posts/${postId}`, {
								headers: { 'Authorization': `Bearer ${token}` }
							});

							// volta para a tela anterior
							navigation.goBack();

						} catch (error) {
							console.error('Erro ao excluir post:', error);
							Alert.alert('Erro', 'Não foi possível excluir o post');
						}
					}
				}
			]
		);
	};

	// Função para atualizar partes específicas do estado
	const updatePostData = (field, value) => {
		setPostData(prev => ({ ...prev, [field]: value }));
	};

	// Função de atualização
	const handleTitleSave = () => {
		updatePostData('title', editableTitle);
		setTitleModalVisible(false);
	};

	// Função de atualização
	const handleDescriptionSave = () => {
		updatePostData('description', editableDescription);
		setDescriptionModalVisible(false);
	};

	// Função de atualização
	const handleGradeUpdate = (newGrade) => {
		updatePostData('grade', newGrade);
	};

	// Função de atualização
	const toggleCover = (value) => {
		updatePostData('cover', value);
	};

	// Função para simplificar o nome da localização
	const simplifyLocationName = (fullLocation) => {
		if (!fullLocation) return '';

		// substitui hífens por vírgulas para uniformizar o processamento
		const normalizedLocation = fullLocation.replace(/ - /g, ', ');

		// divide por vírgulas
		const parts = normalizedLocation.split(',');

		// se tiver menos de 2 partes, retorna o texto original
		if (parts.length < 2) return fullLocation;

		// retorna apenas as duas primeiras partes
		return `${parts[0].trim()}, ${parts[1].trim()}`;
	};

	if (loading || !postData) {
		return (
			<View style={styles.container}>
				<Text style={styles.loadingText}>Carregando...</Text>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.titleContainer}>
					<TouchableOpacity onPress={() => setTitleModalVisible(true)}>

						{/* título */}
						<TextInput
							style={styles.titleInput}
							value={postData.title}
							editable={false}
							placeholder="Título do post"
							placeholderTextColor="#B1AEAE"
							multiline={true}
							numberOfLines={2}
						/>
					</TouchableOpacity>

					{/* nota */}
					<TouchableOpacity onPress={() => setRatingModalVisible(true)}>
						<View style={styles.ratingContainer}>
							<Text style={styles.grade}>
								{postData?.grade ? parseFloat(postData.grade).toFixed(1) : "0.0"}
							</Text>
							<FontAwesome name="star" size={24} color="#FFD700" />
						</View>
					</TouchableOpacity>
				</View>

				{/* localização */}
				{postData.nameLocation ? (
					<TouchableOpacity onPress={() => setLocationModalVisible(true)}>
						<View style={styles.locationContainer}>
							<FontAwesome name="map-marker" size={18} color="#5EDFFF" />
							<Text style={styles.locationText}>
								{simplifyLocationName(postData.nameLocation)}
							</Text>
						</View>
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						style={styles.addLocationButton}
						onPress={() => navigation.navigate('InputPhotoLocation', { postId })}
					>
						<FontAwesome name="map-marker" size={16} color="#5EDFFF" />
						<Text style={styles.addLocationText}>Adicionar localização</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* modal de confirmação de edição de localização */}
			<Modal
				visible={isLocationModalVisible}
				transparent={true}
				animationType="slide"
				onRequestClose={() => setLocationModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>Editar a localização?</Text>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.cancelButton}
								onPress={() => setLocationModalVisible(false)}
							>
								<Text style={styles.cancelButtonText}>Cancelar</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.confirmButton}
								onPress={() => {
									setLocationModalVisible(false);

									// passa o ID do post, função UpdatePhotoData e navega para InputPhotoLocation
									navigation.navigate('InputPhotoLocation', {
										postId,
										updatePhotoData: (field, value) => updatePostData(field, value)
									});
								}}
							>
								<Text style={styles.confirmButtonText}>Confirmar</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{/* Imagem */}
			<Image
				source={{ uri: postData.imagem }}
				style={[
					styles.postImage,
					{ height: imageSize.height > 0 ? imageSize.height : 450 }
				]}
			/>

			{/* Descrição */}
			<TouchableOpacity onPress={() => setDescriptionModalVisible(true)}>
				<TextInput
					style={styles.descriptionInput}
					value={postData.description}
					editable={false}
					placeholder="Descrição do post"
					placeholderTextColor="#B1AEAE"
					multiline
				/>
			</TouchableOpacity>

			{/* Mapa */}
			{postData.location && postData.location.latitude && postData.location.longitude && (
				<>
					<Text style={styles.mapTitle}>No mapa</Text>
					<View style={styles.mapContainer}>
						<MapView
							style={styles.map}
							scrollEnabled={true}
							initialRegion={{
								latitude: postData.location.latitude,
								longitude: postData.location.longitude,
								latitudeDelta: 0.05,
								longitudeDelta: 0.05,
							}}
						>
							<Marker
								coordinate={{
									latitude: postData.location.latitude,
									longitude: postData.location.longitude,
								}}
								pinColor="#5EDFFF"
								description={postData.nameLocation ? simplifyLocationName(postData.nameLocation) : ""}
							/>
						</MapView>
					</View>
				</>
			)}

			{/* Data */}
			<View style={styles.dateContainer}>
				<Feather name="map" size={20} color="#5EDFFF" />
				<Text style={styles.dateText}>
					{postData.createdAt ?
						format(new Date(postData.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) :
						"Data não disponível"}
				</Text>
			</View>

			{/* Capa do Álbum */}
			<View style={styles.coverContainer}>
				<Text style={styles.coverTitle}>Capa do Álbum</Text>
				<View style={styles.coverOptions}>
					<TouchableOpacity
						style={[styles.coverOption, postData.cover && styles.coverOptionSelected]}
						onPress={() => toggleCover(true)}
					>
						<Text style={styles.coverOptionText}>Sim</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.coverOption, !postData.cover && styles.coverOptionSelected]}
						onPress={() => toggleCover(false)}
					>
						<Text style={styles.coverOptionText}>Não</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Botões */}
			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={styles.cancelButton}
					onPress={() => navigation.goBack()}
				>
					<Text style={styles.cancelButtonText}>Cancelar</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.saveButton}
					onPress={handleEditSave}
				>
					<Text style={styles.saveButtonText}>Salvar</Text>
				</TouchableOpacity>
			</View>

			{/* Botão Excluir */}
			<TouchableOpacity
				style={styles.deleteButton}
				onPress={handleDeletePost}
			>
				<Text style={styles.deleteButtonText}>Excluir Post</Text>
			</TouchableOpacity>

			{/* Rating Modal */}
			<RatingModal
				visible={isRatingModalVisible}
				onClose={() => setRatingModalVisible(false)}
				onSave={handleGradeUpdate}
				initialRating={postData.grade}
			/>

			{/* Edit Title Modal */}
			<EditPostModal
				visible={isTitleModalVisible}
				onClose={() => setTitleModalVisible(false)}
				onSave={handleTitleSave}
				value={editableTitle}
				setValue={setEditableTitle}
				title="Editar título da foto?"
			/>

			{/* Edit Description Modal */}
			<EditPostModal
				visible={isDescriptionModalVisible}
				onClose={() => setDescriptionModalVisible(false)}
				onSave={handleDescriptionSave}
				value={editableDescription}
				setValue={setEditableDescription}
				title="Editar descrição da foto?"
			/>
		</ScrollView>
	);
};


const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#031F2B',
		paddingHorizontal: 10,
	},
	loadingText: {
		color: '#FFF',
		fontSize: 18,
		marginTop: 20,
		textAlign: 'center',
	},
	header: {
		marginTop: 0,
	},
	titleContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 5,
	},
	titleInput: {
		flex: 1,
		maxWidth: 310,
		color: '#FFF',
		fontSize: 20,
		lineHeight: 20,
		fontFamily: 'Poppins-SemiBold',
		paddingBottom: 0,
		multiline: true,
		textAlignVertical: 'top',
	},
	ratingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		columnGap: 5,
	},
	grade: {
		color: '#FFF',
		fontSize: 20,
		fontFamily: 'Poppins-Medium',
	},
	locationContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		maxWidth: 250,
		paddingRight: 10,
		marginBottom: 15,
	},
	locationText: {
		color: "#5EDFFF",
		fontSize: 13,
		fontFamily: 'Poppins-SemiRegular',
		marginLeft: 5,
	},
	addLocationButton: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 10,
		marginBottom: 10,
	},
	addLocationText: {
		color: '#5EDFFF',
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
		marginLeft: 5,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContainer: {
		width: '80%',
		backgroundColor: '#031F2B',
		borderRadius: 10,
		padding: 20,
		alignItems: 'center',
	},
	modalTitle: {
		color: '#FFF',
		fontSize: 18,
		fontFamily: 'Poppins-Medium',
		marginBottom: 10,
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
	},
	cancelButton: {
		flex: 1,
		padding: 10,
		backgroundColor: '#263238',
		borderRadius: 8,
		marginRight: 5,
		alignItems: 'center',
	},
	cancelButtonText: {
		color: '#5EDFFF',
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
	},
	confirmButton: {
		flex: 1,
		padding: 10,
		backgroundColor: '#5EDFFF',
		borderRadius: 8,
		marginLeft: 5,
		alignItems: 'center',
	},
	confirmButtonText: {
		color: '#031F2B',
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
	},
	postImage: {
		width: '100%',
		borderRadius: 10,
		marginBottom: 5,
	},
	descriptionInput: {
		color: '#FFFFFF',
		fontSize: 15,
		fontFamily: 'Poppins-Regular',
		textAlignVertical: 'top',
		minHeight: 100,
	},
	mapTitle: {
		color: '#FFF',
		fontSize: 18,
		fontFamily: 'Poppins-SemiBold',
		marginLeft: 5,
	},
	mapContainer: {
		height: 300,
		borderRadius: 10,
		overflow: 'hidden',
		marginBottom: 10,
	},
	map: {
		flex: 1,
	},
	dateContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 5,
		marginBottom: 5,
	},
	dateText: {
		color: '#FFFFFF',
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
		marginLeft: 10,
	},
	coverContainer: {
		paddingVertical: 20,
		marginBottom: 10,
	},
	coverTitle: {
		color: '#FFFFFF',
		fontSize: 16,
		fontFamily: 'Poppins-Medium',
		marginBottom: 10,
	},
	coverOptions: {
		flexDirection: 'row',
		columnGap: 10,
	},
	coverOption: {
		paddingVertical: 8,
		paddingHorizontal: 20,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: '#5EDFFF',
	},
	coverOptionSelected: {
		backgroundColor: '#5EDFFF',
	},
	coverOptionText: {
		color: '#FFF',
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	cancelButton: {
		flex: 1,
		padding: 15,
		backgroundColor: '#263238',
		borderRadius: 8,
		marginRight: 10,
	},
	cancelButtonText: {
		color: '#5EDFFF',
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
		textAlign: 'center',
	},
	saveButton: {
		flex: 1,
		padding: 15,
		backgroundColor: '#5EDFFF',
		borderRadius: 8,
		marginLeft: 10,
	},
	saveButtonText: {
		color: '#031F2B',
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
		textAlign: 'center',
	},
	deleteButton: {
		padding: 15,
		backgroundColor: '#FF4444',
		borderRadius: 8,
		marginBottom: 20,
	},
	deleteButtonText: {
		color: '#FFF',
		fontSize: 14,
		fontFamily: 'Poppins-Medium',
		textAlign: 'center',
	},
});

export default Post;