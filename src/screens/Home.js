import React from 'react';
import axios from 'axios';
import { API_URL } from '@env';
import { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	Image,
	TextInput,
	ScrollView,
	TouchableOpacity,
	FlatList,
	useWindowDimensions
} from 'react-native';


const Home = () => {
	const windowWidth = useWindowDimensions().width;
	const navigation = useNavigation();
	const [userData, setUserData] = useState(null);
	const [userAlbums, setUserAlbums] = useState([]);
	const [bestPosts, setBestPosts] = useState([]);
	const [activeFilter, setActiveFilter] = useState(null);
	const [filteredAlbums, setFilteredAlbums] = useState([]);
	const [isFiltering, setIsFiltering] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchTimeout, setSearchTimeout] = useState(null);
	const [imageSizes, setImageSizes] = useState({});
	const [loading, setLoading] = useState(true);

	const filters = [
		{ id: '1', name: 'beach', label: 'Praia', field: 'typeTrip' },
		{ id: '2', name: 'mountain', label: 'Montanha', field: 'typeTrip' },
		{ id: '3', name: 'city', label: 'Cidade', field: 'typeTrip' },
		{ id: '4', name: 'forest', label: 'Floresta', field: 'typeTrip' },
		{ id: '5', name: 'mergulho', label: 'Mergulho', field: 'tripActivity' },
		{ id: '6', name: 'pedal', label: 'Pedal', field: 'tripActivity' },
		{ id: '7', name: 'work', label: 'Trabalho', field: 'typeTrip' },
	];

	// Recupera os dados no AsyncStorage
	useEffect(() => {
		const getUserData = async () => {
			try {
				const userDataString = await AsyncStorage.getItem('@user_data');
				if (userDataString) {
					const userData = JSON.parse(userDataString);
					setUserData(userData);
				}
			} catch (error) {
				console.log('Erro ao buscar dados do usuário:', error);
			}
		};

		getUserData();
	}, []);

	// useEffect calcular tamanhos de imagens pesquisadas
	useEffect(() => {
		if (searchResults && searchResults.length > 0) {
			searchResults.forEach(post => {
				if (post.imagem) {
					calculateImageSize(post.imagem, post._id);
				}
			});
		}
	}, [searchResults]);

	// Busca os álbuns do usuário
	const fetchUserAlbums = async () => {
		try {
			setLoading(true);
			// recupera o token do AsyncStorage
			const token = await AsyncStorage.getItem('@auth_token');

			// recupera os álbuns do usuário
			const response = await axios.get(`${API_URL}/user/albums`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			// armazena os álbuns do usuário
			setUserAlbums(response.data.albums);
			setLoading(false);

		} catch (error) {
			console.log('Erro ao buscar álbuns:', error);
			setLoading(false);
		}
	};

	// Busca os dados dos albuns
	useEffect(() => {
		fetchUserAlbums();
	}, []);

	// useFocusEffect para buscar melhores fotos
	useFocusEffect(
		React.useCallback(() => {
			const fetchInitialData = async () => {
				try {
					setLoading(true);
					const token = await AsyncStorage.getItem('@auth_token');

					// busca álbuns e melhores fotos
					const [albumsResponse, bestPostsResponse] = await Promise.all([
						axios.get(`${API_URL}/user/albums`, {
							headers: { 'Authorization': `Bearer ${token}` }
						}),
						axios.get(`${API_URL}/posts/best`, {
							headers: { 'Authorization': `Bearer ${token}` }
						})
					]);

					setUserAlbums(albumsResponse.data.albums);
					setBestPosts(bestPostsResponse.data.posts);

				} catch (error) {
					console.error('Erro ao carregar dados:', error);
				} finally {
					setLoading(false);
				}
			};

			fetchInitialData();
		}, [])
	);

	// Função para fazer a pesquisa nos posts
	const handleSearch = (text) => {
		setSearchQuery(text);

		// limpa o timeout anterior para evitar múltiplas requisições
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		// se o campo estiver vazio, limpa os resultados
		if (!text || text.trim() === '') {
			setIsSearching(false);
			setSearchResults([]);
			return;
		}

		// requisição para buscar posts da pesquisa
		const timeout = setTimeout(async () => {
			try {
				setIsSearching(true);
				setLoading(true);

				const token = await AsyncStorage.getItem('@auth_token');
				const response = await axios.get(`${API_URL}/posts/search`, {
					headers: { 'Authorization': `Bearer ${token}` },
					params: { query: text }
				});

				setSearchResults(response.data.posts);
				setLoading(false);

			} catch (error) {
				console.error('Erro ao pesquisar posts:', error);
				setLoading(false);
			}
		}, 500);

		setSearchTimeout(timeout);
	};

	// Função para filtrar os álbuns
	const handleFilterClick = async (filter) => {
		try {
			// desativar filtro se já estiver ativo
			if (activeFilter === filter.id) {
				setActiveFilter(null);
				setIsFiltering(false);
				return;
			}

			setActiveFilter(filter.id);
			setLoading(true);

			// busca o token do AsyncStorage
			const token = await AsyncStorage.getItem('@auth_token');

			// Cria o objeto de parâmetros com o campo (typeTrip ou tripActivity)
			const params = {};
			params[filter.field] = filter.name;

			// busca os álbuns filtrados 
			const response = await axios.get(`${API_URL}/albums/filter`, {
				headers: { 'Authorization': `Bearer ${token}` },
				params: params
			});

			setFilteredAlbums(response.data.albums);
			setIsFiltering(true);
			setLoading(false);

		} catch (error) {
			console.error('Erro ao filtrar álbuns:', error);
			Alert.alert('Erro', 'Não foi possível carregar os álbuns filtrados');
			setLoading(false);
		}
	};

	// função para calcular o tamanho de imagem pesquisada
	const calculateImageSize = (imageUrl, postId) => {
		if (!imageUrl) return;

		Image.getSize(imageUrl, (width, height) => {
			// altura proporcional com base na largura disponível
			const screenWidth = windowWidth - 40; // considerar padding
			const scaleFactor = screenWidth / width;
			const calculatedHeight = height * scaleFactor;

			// mínimo e máximo para a altura
			const finalHeight = Math.min(Math.max(calculatedHeight, 250), 600);

			setImageSizes(prev => ({
				...prev,
				[postId]: {
					width: screenWidth,
					height: finalHeight
				}
			}));
		}, error => console.log('Erro ao obter tamanho da imagem:', error));
	};


	return (
		<SafeAreaView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={styles.greeting}>Olá {userData?.name || 'User'},</Text>
						<Text style={styles.title}>Vamos viajar!</Text>
					</View>
					<Image
						source={userData?.userImg
							? { uri: userData.userImg }
							: require('../assets/images/profile.jpg')}
						style={styles.profileImage}
					/>
				</View>

				{/* Campo de Pesquisa */}
				<View style={styles.searchContainer}>
					<TextInput
						style={styles.searchInput}
						placeholder="Pesquisa livre"
						placeholderTextColor="#5EDFFF"
						value={searchQuery}
						onChangeText={handleSearch}
					/>
					<Feather name="search" size={20} color="#5EDFFF" style={styles.searchIcon} />
				</View>

				{/* Filtro de Botões */}
				<FlatList horizontal
					showsHorizontalScrollIndicator={false}
					data={filters}
					keyExtractor={(item) => item.id}
					style={styles.filterList}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={[
								styles.filterButton,
								activeFilter === item.id ? styles.filterButtonActive : styles.filterButtonInactive
							]}
							onPress={() => handleFilterClick(item)}
						>
							<Text style={[
								styles.filterText,
								activeFilter === item.id ? styles.filterTextActive : styles.filterTextInactive
							]}>
								{item.label}
							</Text>
						</TouchableOpacity>
					)}
				/>

				{/* Melhores fotos */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Melhores Fotos</Text>
					<FlatList
						horizontal
						showsHorizontalScrollIndicator={false}
						data={bestPosts}
						keyExtractor={(item) => item._id}
						style={styles.albumList}
						renderItem={({ item }) => (
							<TouchableOpacity
								style={styles.albumCard}
								onPress={() => navigation.navigate('Post', { postId: item._id })}
							>
								<Image
									source={{ uri: item.imagem }}
									style={styles.albumImage}
								/>
								<View style={styles.albumInfo}>
									<Text style={styles.albumTitle}>{item.title}</Text>
								</View>
							</TouchableOpacity>
						)}
						ListEmptyComponent={() => (
							<Text style={styles.emptyText}>Nenhuma foto com nota máxima ainda</Text>
						)}
					/>
				</View>

				{/* Seção Álbuns OU Pesquisa OU Filtrados */}
				<View style={styles.section}>
					{/* Condição para exibir texto do título  */}
					<Text style={styles.sectionTitle}>
						{isSearching
							? `Resultados da Pesquisa (${searchResults.length})`
							: isFiltering
								? 'Resultados do Filtro'
								: 'Álbuns'
						}
					</Text>

					{/* Condição de exibição: Pesquisando ou Albuns */}
					{isSearching ? (
						// exibbe quando está pesquisando
						searchResults.length > 0 ? (
							searchResults.map((post) => (
								<TouchableOpacity
									key={post._id}
									style={styles.searchResultCard}
									onPress={() => navigation.navigate('Post', { postId: post._id })}
								>
									<Image
										source={{ uri: post.imagem }}
										style={[
											styles.searchResultImage,
											// altura dinâmica se disponível
											imageSizes[post._id] ? { height: imageSizes[post._id].height } : { aspectRatio: 1 }
										]}
									/>
									<View style={styles.featuredInfo}>
										<View>
											<Text style={styles.featuredTitle}>{post.title}</Text>
											<Text style={styles.featuredDestination}>{post.nameLocation || 'Local não especificado'}</Text>
										</View>
									</View>
								</TouchableOpacity>
							))
						) : (
							<Text style={styles.noPostsText}>Nenhum post encontrado com essa pesquisa</Text>
						)
					) : isFiltering ? (
						// exibe quando está filtrando
						filteredAlbums.length > 0 ? (
							filteredAlbums.map((album) => (
								// código filtrando
								<TouchableOpacity
									key={album._id}
									style={styles.filteredCard}
									onPress={() => navigation.navigate('Album', { albumId: album._id })}
								>
									<Image
										source={
											album.cover?.imagem
												? { uri: album.cover.imagem }
												: require('../assets/images/placeholder.png')
										}
										style={styles.featuredImage}
									/>
									<View style={styles.featuredInfo}>
										<View>
											<Text style={styles.featuredTitle}>{album.title}</Text>
											<Text style={styles.featuredDestination}>{album.destination}</Text>
										</View>
										<View style={styles.ratingContainer}>
											<Text style={styles.rating}>{album.grade
												? Number.isInteger(album.grade)
													? `${album.grade}.0`
													: album.grade.toFixed(1)
												: '0.0'}
											</Text>
											<FontAwesome name="star" size={25} color="#FFD700" />
										</View>
									</View>
								</TouchableOpacity>
							))
						) : (
							<Text style={styles.noPostsText}>Nenhum álbum encontrado com esse filtro</Text>
						)
					) : (
						// exibe os álbuns normalmente
						userAlbums.length > 0 ? (
							userAlbums.map((album) => (
								// código dos álbuns
								<TouchableOpacity
									key={album._id}
									style={styles.featuredCard}
									onPress={() => navigation.navigate('Album', { albumId: album._id })}
								>
									<Image
										source={
											album.cover?.imagem
												? { uri: album.cover.imagem }
												: require('../assets/images/placeholder.png')
										}
										style={styles.featuredImage}
									/>
									<View style={styles.featuredInfo}>
										<View>
											<Text style={styles.featuredTitle}>{album.title}</Text>
											<Text style={styles.featuredDestination}>{album.destination}</Text>
										</View>
										<View style={styles.ratingContainer}>
											<Text style={styles.rating}>{album.grade
												? Number.isInteger(album.grade)
													? `${album.grade}.0`
													: album.grade.toFixed(1)
												: '0.0'}
											</Text>
											<FontAwesome name="star" size={25} color="#FFD700" />
										</View>
									</View>
								</TouchableOpacity>
							))
						) : (
							<Text style={styles.emptyText}>Nenhum álbum postado ainda</Text>
						)
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#031F2B',
		paddingBottom: 50,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	greeting: {
		color: '#cccccc',
		fontSize: 16,
		fontFamily: 'Poppins-Regular',
	},
	title: {
		color: '#FFF',
		fontSize: 24,
		lineHeight: 28,
		fontFamily: 'Poppins-Bold',
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},
	searchContainer: {
		margin: 20,
		position: 'relative',
	},
	searchInput: {
		backgroundColor: '#263238',
		borderRadius: 8,
		padding: 12,
		fontFamily: 'Poppins-Regular',
		color: '#5EDFFF',
		borderColor: '#5EDFFF',
		borderWidth: 1,
	},
	searchIcon: {
		position: 'absolute',
		right: 12,
		top: 12,
	},
	filterList: {
		paddingHorizontal: 20,
	},
	filterButton: {
		backgroundColor: '#5EDFFF',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		marginRight: 10,
	},
	filterButtonActive: {
		backgroundColor: '#5EDFFF',
	},
	filterButtonInactive: {
		backgroundColor: '#263238',
	},
	filterText: {
		color: '#031F2B',
		fontFamily: 'Poppins-Medium',
	},
	filterTextActive: {
		color: '#031F2B',
	},
	filterTextInactive: {
		color: '#cccccc',
	},
	section: {
		padding: 20,
	},
	sectionTitle: {
		color: '#FFF',
		fontSize: 18,
		fontFamily: 'Poppins-SemiBold',
		marginBottom: 5,
	},
	albumList: {
		marginLeft: -20,
		marginRight: -20,
		paddingHorizontal: 20,
	},
	albumCard: {
		width: 150,
		height: 200,
		marginRight: 15,
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: '#263238',
		position: 'relative',
		elevation: 4,
		shadowColor: '#fff',
		shadowRadius: 8,
	},
	albumImage: {
		width: '100%',
		height: '100%',
		borderRadius: 8,
	},
	albumInfo: {
		paddingHorizontal: 5,
		paddingBottom: 5,
		position: 'absolute',
		bottom: 0,
		left: 0,
	},
	albumTitle: {
		color: '#FFF',
		fontFamily: 'Poppins-SemiBold',
		fontSize: 14,
	},
	emptyText: {
		color: '#fffc'
	},
	albumTime: {
		color: '#ffffff',
		fontFamily: 'Poppins-Regular',
		fontSize: 12,
		marginTop: -5,
	},
	featuredCard: {
		width: '100%',
		height: 150,
		marginBottom: 20,
		borderRadius: 8,
		overflow: 'hidden',
		position: 'relative',
		elevation: 5,
		shadowColor: '#fff',
		shadowOffset: {
			width: 0,
			height: -4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
	},
	featuredImage: {
		width: '100%',
		height: '100%',
		borderRadius: 8,
		resizeMode: "cover",
	},
	featuredInfo: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 10,
		position: 'absolute',
		bottom: 0,
		left: 0,
	},
	featuredTitle: {
		color: '#fff',
		fontFamily: 'Poppins-SemiBold',
		fontSize: 14,
		marginTop: -10,
	},
	featuredDestination: {
		color: '#fff',
		fontFamily: 'Poppins-Bold',
		fontSize: 18,
	},
	ratingContainer: {
		flexDirection: 'row',
		gap: 2,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	rating: {
		fontSize: 20,
		color: '#fff',
		fontFamily: 'Poppins-SemiBold',
	},
	noPostsText: {
		color: '#fff',
		fontFamily: 'Poppins-Regular',
		fontSize: 12,
		textAlign: 'left',
	},
	searchResultCard: {
		width: '100%',
		marginBottom: 20,
		borderRadius: 8,
		overflow: 'hidden',
		position: 'relative',
	},
	searchResultImage: {
		width: '100%',
		borderRadius: 8,
		resizeMode: "cover",
	},
	filteredCard: {
		width: '100%',
		height: 200,
		marginBottom: 20,
		borderRadius: 8,
		overflow: 'hidden',
		position: 'relative',
	},
	searchResultImage: {
		width: '100%',
		borderRadius: 8,
		resizeMode: "cover",
	},
});

export default Home;