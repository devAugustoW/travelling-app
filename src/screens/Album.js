import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { API_URL } from '@env';

import RatingModal from '../components/RatingModal';

const Album = ({ route }) => {
  const { albumId } = route.params;
  const [album, setAlbum] = useState(null);
	const [posts, setPosts] = useState([]);
	const [token, setToken] = useState(null);
	const [locationCaptured, setLocationCaptured] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedPost, setSelectedPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigation = useNavigation();

  // busca os dados do álbum e seus posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Pega o token do AsyncStorage
        const token = await AsyncStorage.getItem('@auth_token');
        if (!token) {
          Alert.alert('Erro', 'Você precisa estar logado');
          return;
        }
				setToken(token);

        // Faz a requisição para buscar os dados do álbum
        const albumResponse = await axios.get(`${API_URL}/albums/${albumId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setAlbum(albumResponse.data);

        // Atualiza o estado de localização capturada
        if (albumResponse.data.location) {
          setLocationCaptured(true);
        }
				
        // Faz a requisição para buscar os posts do álbum
        const postsResponse = await axios.get(`${API_URL}/albums/${albumId}/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPosts(postsResponse.data);

      } catch (error) {
        console.log('Erro ao buscar dados:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do álbum e seus posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [albumId]);

  if (loading || !album) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

	// função para capturar a localização do álbum
	const handleCheckIn = async () => {
    try {
			// executa solicitação de permissão
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permissão para acessar localização foi negada.');
        return;
      }

			// pega a localização atual
      const location = await Location.getCurrentPositionAsync({});

			// atualiza o estado de localização capturada
      setLocationCaptured(true); 

    } catch (error) {
      console.log('Erro ao capturar localização:', error);
      Alert.alert('Erro', 'Não foi possível capturar a localização.');
    }
  };

	// Função para abrir o modal de avaliação
	const openRatingModal = (post) => {
		setSelectedPost(post);
		setModalVisible(true);
	};

	// Função para salvar a avaliação
  const saveRating = async (rating) => {
    try {
      if (!selectedPost) return;
      
      // Fazer a requisição para atualizar a nota do post
      await axios.patch(
        `${API_URL}/posts/${selectedPost._id}`, 
        { nota: rating },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Atualizar o estado local
      const updatedPosts = posts.map(post => 
        post._id === selectedPost._id ? {...post, nota: rating} : post
      );
      setPosts(updatedPosts);
      
      // Fechar o modal
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      Alert.alert('Erro', 'Não foi possível salvar a avaliação');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
				contentContainerStyle={styles.scrollViewContent}
				showsVerticalScrollIndicator={false}
			>
        {/* Seção da capa */}
				<View style={{ position: 'relative' }}>
					{album.cover ? (
						<Image 
							source={{ uri: posts.find(post => post.cover === true).imagem }}  
							style={styles.coverImage}
							resizeMode="cover"
						/>
					) : (
						<LinearGradient
							colors={['#031F2B', '#1B3B4D', '#5EDFFF']}
							start={{ x: 0.5, y: 0 }}
							end={{ x: 0.5, y: 2 }}
							style={styles.coverGradient}
						/>
					)}
					<View style={styles.coverOverlay}>
						<Text style={styles.albumTitle}>{album.title}</Text>
						<View style={styles.ratingContainer}>
							<Text style={styles.albumGrade}>{album.grade || '0.0'}</Text>
							<Feather name="star" size={24} color="#FFD700" />
						</View>
					</View>
				</View>

        {/* Ícones de informação */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
						<View style={styles.iconBackground}>
							<Feather name="trending-up" size={24} color="#5EDFFF" />
						</View>
            <Text style={styles.infoTitle}>Dificuldade</Text>
            <Text style={styles.infoText}>{album.difficulty || <Text>N/A</Text>}</Text>
          </View>

          <View style={styles.infoItem}>
					<View style={styles.iconBackground}>
      			<Feather name="clock" size={24} color="#5EDFFF" />
    			</View>
            <Text style={styles.infoTitle}>Tempo de Viagem</Text>
            <Text style={styles.infoText}>{album.timeTravel || <Text>N/A</Text>}</Text>
          </View>

          <View style={styles.infoItem}>
					<View style={styles.iconBackground}>
						<Feather name="tag" size={24} color="#5EDFFF" />
					</View>
            <Text style={styles.infoTitle}>Ticket</Text>
            <Text style={styles.infoText}>{album.cost || <Text>N/A</Text>}</Text>
          </View>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Sobre */}
        <View style={styles.aboutContainer}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.description}>{album.description || 'Sem descrição'}</Text>
        </View>

				{/* Posts do álbum */}
				<View style={styles.postsContainer}>
          
          {posts && posts.length > 0 ? (
            posts.map((post, index) => (
              <View key={post._id || index} 
							style={[
								styles.postItem,
								index > 0 && styles.postItemWithMargin 
							]}>
                {/* Imagem do post */}
                <Image 
                  source={{ uri: post.imagem }} 
                  style={styles.postImage}
                  resizeMode="cover"
                />
                
                {/* Informações do post */}
                <View style={styles.postInfoContainer}>
								<View style={styles.postHeader}>
									<Text style={styles.postTitle}>{post.title}</Text>
									<TouchableOpacity 
										style={styles.postRating}
										onPress={() => openRatingModal(post)}
									>
										<Text style={styles.postGrade}>{post.nota || '0.0'}</Text>
										<Feather name="star" size={24} color="#FFD700" />
									</TouchableOpacity>
								</View>
                  <Text style={styles.postDescription}>{post.description}</Text>
                </View>
                
                {/* Separador entre posts (exceto o último) */}
                {index < posts.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noPostsText}>Nenhuma foto adicionada ainda</Text>
          )}
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Mapa */}
        {album.location && album.location.latitude && album.location.longitude && (
					<View style={styles.mapContainer}>
						<Text style={styles.sectionTitle}>No mapa</Text>
						<View style={styles.mapWrapper}>
							<MapView
								style={styles.map}
								initialRegion={{
									latitude: album.location.latitude,
									longitude: album.location.longitude,
									latitudeDelta: 0.10,
									longitudeDelta: 0.10,
								}}
							>
								<Marker
									coordinate={{
										latitude: album.location.latitude,
										longitude: album.location.longitude,
									}}
								/>
							</MapView>
						</View>
					</View>
				)}

        {/* Botões */}
        <View style={styles.buttonContainer}>
					<TouchableOpacity 
            style={styles.tripMapButton}
            onPress={handleCheckIn} 
          >
            <Feather name="map" size={20} color="#5EDFFF" />
            <Text style={styles.buttonText}>
              {locationCaptured ? 'Trip Map' : 'Check In'} 
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.photoButton}
						onPress={() =>  navigation.navigate('NewPhoto', { albumId })}>
            <Text style={[styles.buttonText, styles.photoButtonText]}>Foto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

			{/* componente RatingModal */}
			<RatingModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={saveRating}
        initialRating={selectedPost?.nota || 0}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031F2B',
  },
	scrollViewContent: {
		flexGrow: 1,
		justifyContent: 'space-between',
	},
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  coverImage: {
    width: '100%',
    height: 300,
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
  },
  coverGradient: {
    width: '100%',
    height: 300,
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
  },
	coverOverlay: {
		position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
		paddingBottom: 10,
    borderRadius: 8,
		zIndex: 100,
	},
	albumTitle: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
  albumGrade: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
  ratingContainer: {
    flexDirection: 'row',
		columnGap: 5,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  infoItem: {
    alignItems: 'center',
		marginTop: 10,
  },
	iconBackground: {
    backgroundColor: '#263238',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
  },
  infoText: {
    color: '#5EDFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#263238',
    marginHorizontal: 20,
  },
  aboutContainer: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 2,
  },
  description: {
    color: '#B1AEAE',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
	postsContainer: {
    padding: 20,
		paddingBottom: 10,
  },
  postItem: {
    marginBottom: 10,
  },
	postItemWithMargin: {
		marginTop:20,
	},
  postImage: {
    width: 'auto',
    height: 450,
    borderRadius: 10,
    marginBottom: 15,
  },
  postInfoContainer: {
    paddingHorizontal: 5,
		marginBottom: 5,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postTitle: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
  postRating: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
  },
  postGrade: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
  postDescription: {
    color: '#B1AEAE',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 5,
  },
	noPostsText: {
    color: '#B1AEAE',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  mapContainer: {
    padding: 20,
		
  },
	mapWrapper: {
		borderRadius: 10,
		overflow: 'hidden',
	},
  map: {
    width: '100%',
    height: 400,
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
		backgroundColor: '#031F2B',
  },
  tripMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#263238',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  photoButton: {
    backgroundColor: '#5EDFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#5EDFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginLeft: 8,
  },
  photoButtonText: {
    color: '#031F2B',
    textAlign: 'center',
    marginLeft: 0,
  },
});

export default Album;