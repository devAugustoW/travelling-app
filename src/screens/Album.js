import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Alert,
	Modal,
  TextInput,
	useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker, Polygon  } from 'react-native-maps';
import axios from 'axios';
import { API_URL } from '@env';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import RatingModal from '../components/RatingModal';

console.log(API_URL)
const Album = ({ route }) => {
  const { albumId } = route.params;
	const [token, setToken] = useState(null);
  const [album, setAlbum] = useState(null);
	const [posts, setPosts] = useState([]);
	const [locationCaptured, setLocationCaptured] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedPost, setSelectedPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [postImageSizes, setPostImageSizes] = useState({});
  const windowWidth = useWindowDimensions().width;
	const navigation = useNavigation();

	const [titleModalVisible, setTitleModalVisible] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
	const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [editableDescription, setEditableDescription] = useState('');
	

  // useFocusEffect -> remonta o componente ao voltar na tela
  useFocusEffect(
		React.useCallback(() => {
			const fetchData = async () => {
				try {
        setLoading(true);
        // pega o token do AsyncStorage
        const token = await AsyncStorage.getItem('@auth_token');
        if (!token) {
          Alert.alert('Erro', 'Você precisa estar logado');
          return;
        }
				setToken(token);

        // faz a requisição para buscar os dados do álbum
        const albumResponse = await axios.get(`${API_URL}/albums/${albumId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setAlbum(albumResponse.data);

        // atualiza estado de localização capturada - VERSÃO CORRIGIDA
        if (albumResponse.data.location && 
            (albumResponse.data.location.latitude !== 0 || 
             albumResponse.data.location.longitude !== 0)) {
          setLocationCaptured(true);
        } else {
          setLocationCaptured(false);
        }
				
        // buscar os posts do álbum
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
  	}, [albumId, token])
	);

	// Função para calcular dimensões de imagens
  const calculateImageDimensions = useCallback((imageUri, postId) => {
    Image.getSize(imageUri, (width, height) => {
      // altura proporcional com base na largura 
      const screenWidth = windowWidth - 40; // padding 
      const scaleFactor = screenWidth / width;
      const calculatedHeight = height * scaleFactor;
      
      // mínimo e máximo para a altura
      const finalHeight = Math.min(Math.max(calculatedHeight, 200), 500);
      
      setPostImageSizes(prev => ({
        ...prev,
        [postId]: {
          width: screenWidth,
          height: finalHeight
        }
      }));
    }, error => console.log('Erro ao obter tamanho da imagem:', error));
  }, [windowWidth]);

	// Calcular dimensões das imagens quando os posts forem carregados
  useEffect(() => {
    if (posts && posts.length > 0) {
      posts.forEach(post => {
        if (post.imagem && post._id) {
          calculateImageDimensions(post.imagem, post._id);
        }
      });
    }
  }, [posts, calculateImageDimensions]);

	// Função para inserir a localização do álbum
	const handleCheckIn = async () => {
    if (locationCaptured) {
      // Se já tiver localização, navega para o TripMap
      navigation.navigate('TripMap', { 
        albumId, 
        albumTitle: album.title 
      });
    } else {
      // Se não tiver localização, navega para o InputAlbumLocation
      navigation.navigate('InputAlbumLocation', { 
        albumId, 
        onLocationSaved: () => {
          // Atualiza o estado após salvar a localização
          setLocationCaptured(true);
        } 
      });
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
			
			// atualiza a grade do post
			await axios.patch(
				`${API_URL}/posts/${selectedPost._id}/grade`, 
				{ grade: rating },
				{	headers: {'Authorization': `Bearer ${token}`}}
			);
			
			// atualiza o estado local dos posts
			const updatedPosts = posts.map(post => 
				post._id === selectedPost._id ? {...post, grade: rating} : post
			);
			setPosts(updatedPosts);
			
			// busca novamente os dados do álbum para obter o grade atualizado
			const albumResponse = await axios.get(`${API_URL}/albums/${albumId}`, {
				headers: {'Authorization': `Bearer ${token}`}
			});
			setAlbum(albumResponse.data);
			
			// fecha o modal
			setModalVisible(false);
		} catch (error) {
			console.error('Erro ao salvar avaliação:', error);
			Alert.alert('Erro', 'Não foi possível salvar a avaliação');
		}
	};

	// Função para salvar a edição do título
  const handleTitleSave = async () => {
    try {
      if (!editableTitle.trim()) {
        Alert.alert('Erro', 'O título não pode estar vazio');
        return;
      }

      // Atualiza o título do álbum na API
      await axios.patch(
        `${API_URL}/albums/${albumId}/title`,
        { title: editableTitle },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Atualiza o estado local
      setAlbum(prev => ({ ...prev, title: editableTitle }));
      
      // Fecha o modal
      setTitleModalVisible(false);
      
      // Exibe mensagem de sucesso
      Alert.alert('Sucesso', 'Título do álbum atualizado com sucesso');
      
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o título do álbum');
    }
  };

	// Função para salvar a edição da descrição
	const handleDescriptionSave = async () => {
		try {
			// atualiza a descrição do álbum na API
			await axios.patch(
				`${API_URL}/albums/${albumId}/description`,
				{ description: editableDescription },
				{ headers: { 'Authorization': `Bearer ${token}` } }
			);

			// atualiza o estado local
			setAlbum(prev => ({ ...prev, description: editableDescription }));
			
			// fecha o modal
			setDescriptionModalVisible(false);
			
			// exibe mensagem de sucesso
			Alert.alert('Sucesso', 'Descrição do álbum atualizada com sucesso');
			
		} catch (error) {
			console.error('Erro ao atualizar descrição:', error);
			Alert.alert('Erro', 'Não foi possível atualizar a descrição do álbum');
		}
	};

	// Atualiza os campos editáveis quando o álbum é carregado
	useEffect(() => {
		if (album) {
			setEditableTitle(album.title);
			setEditableDescription(album.description || '');
		}
	}, [album]);

	// Função para deletar álbum com tratamento de erro simplificado
	const handleDeleteAlbum = async () => {
    // modal de confirmação de exclusão
    Alert.alert(
      'Confirmar exclusão',
      'A exclusão do álbum irá excluir todas as fotos associadas a ele. Deseja prosseguir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true); 
              
              // busca o token no AsyncStorage
              const token = await AsyncStorage.getItem('@auth_token');
              if (!token) {
                Alert.alert('Erro', 'Você precisa estar logado');
                return;
              }
              
              // deleta o álbum
              const response = await axios.delete(`${API_URL}/albums/${albumId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              // exibe mensagem de sucesso
              Alert.alert(
                'Sucesso', 
                `Álbum excluído com sucesso. ${response.data.details?.postsDeleted || 0} fotos foram removidas.`, 
                [
                  { 
                    text: 'OK', 
                    onPress: () => navigation.navigate('Home') 
                  }
                ]
              );
            } catch (error) {
              // extrai informações sobre o erro
              let errorMsg = 'Não foi possível excluir o álbum';
              
              if (error.response && error.response.data) {
                if (error.response.data.message) {
                  errorMsg = error.response.data.message;
                } else if (error.response.data.error) {
                  errorMsg = error.response.data.error;
                }
              }
              
              Alert.alert('Erro', errorMsg);
            } finally {
              setLoading(false); 
            }
          }
        }
      ]
    );
  };


	if (loading || !album) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
				contentContainerStyle={styles.scrollViewContent}
				showsVerticalScrollIndicator={false}
			>
        {/* Seção da capa */}
				<View style={{ position: 'relative' }}>
					{album.cover && posts.length > 0 && posts.find(post => post.cover === true)?.imagem ? (
						<Image 
							source={{ uri: posts.find(post => post.cover === true)?.imagem }}  
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
						<TouchableOpacity onPress={() => setTitleModalVisible(true)}>
              <Text style={styles.albumCoverTitle}>{album.title}</Text>
            </TouchableOpacity>

						<View style={styles.ratingContainer}>
								<Text style={styles.albumGrade}>
									{album.grade 
										? Number.isInteger(album.grade) 
											? `${album.grade}.0` 
											: album.grade.toFixed(1) 
										: '0.0'}
								</Text>
							<FontAwesome name="star" size={24} color="#FFD700" />
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
            <Text style={styles.infoText}>{album.difficulty || 'N/A'}</Text>
          </View>

          <View style={styles.infoItem}>
					<View style={styles.iconBackground}>
      			<Feather name="clock" size={24} color="#5EDFFF" />
    			</View>
            <Text style={styles.infoTitle}>Tempo de Viagem</Text>
            <Text style={styles.infoText}>{album.timeTravel || 'N/A'}</Text>
          </View>

          <View style={styles.infoItem}>
					<View style={styles.iconBackground}>
						<Feather name="tag" size={24} color="#5EDFFF" />
					</View>
            <Text style={styles.infoTitle}>Ticket</Text>
            <Text style={styles.infoText}>{album.cost || 'N/A'}</Text>
          </View>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Sobre */}
        <View style={styles.aboutContainer}>
          <Text style={styles.sectionTitle}>Sobre</Text>
					<TouchableOpacity onPress={() => setDescriptionModalVisible(true)}>
            <Text style={styles.description}>{album.description || ''}</Text>
          </TouchableOpacity>
        </View>

				{/* Posts do álbum */}
				<View style={styles.postsContainer}>
					<Text style={styles.albumTitle}>Fotos</Text>
          {posts && posts.length > 0 ? (
            posts.map((post, index) => (
              <View 
								key={post._id || index} 
								style={[
									styles.postItem,
									index > 0 ? styles.postItemWithMargin : null
								]}>
                	{/* Imagem do post com TouchableOpacity */}
                	<TouchableOpacity
										onPress={() => navigation.navigate('Post', { 
											postId: post._id,
											albumId: albumId 
										})}
									>
										<Image 
											source={{ uri: post.imagem }} 
											style={[
												styles.postImage,
												postImageSizes[post._id] ? 
													{ height: postImageSizes[post._id].height } : 
													{ height: 450 }
											]}
											resizeMode="contain"
										/>
									</TouchableOpacity>
                
                {/* Informações do post */}
                <View style={styles.postInfoContainer}>
									<View style={styles.postHeader}>
										<Text style={styles.postTitle}>{post.title}</Text>
										<TouchableOpacity 
											style={styles.postRating}
											onPress={() => openRatingModal(post)}
										>
											<Text style={styles.postGrade}>
												{parseFloat(post.grade || 0.0).toFixed(1)}
											</Text>
											<FontAwesome name="star" size={24} color="#FFD700" marginBottom="5"/>
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
				{album.location && album.location.latitude && album.location.longitude ? (
					<View style={styles.mapContainer}>
						<Text style={styles.sectionTitle}>No mapa</Text>
						<View style={styles.mapWrapper}>
							<MapView
								style={styles.map}
								scrollEnabled={true}
								initialRegion={{
									latitude: album.location.latitude,
									longitude: album.location.longitude,
									latitudeDelta: 0.99,
									longitudeDelta: 0.99,
								}}
							>
								<Marker
									coordinate={{
										latitude: album.location.latitude,
										longitude: album.location.longitude,
									}}
									pinColor="#5EDFFF"
								/>
							</MapView>
						</View>
					</View>
				) : null}

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

				 {/* Botão Excluir Álbum */}
				 <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeleteAlbum}
        >
          <Text style={styles.deleteButtonText}>Excluir Álbum</Text>
        </TouchableOpacity>
      </ScrollView>

			{/* Componente RatingModal */}
			<RatingModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={saveRating}
        initialRating={selectedPost?.grade || 0}
      />

			{/* Modal para edição do título */}
			<Modal
        visible={titleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTitleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar título do álbum</Text>
            
            <TextInput
              style={styles.modalInput}
              value={editableTitle}
              onChangeText={setEditableTitle}
              placeholder="Digite o novo título"
              placeholderTextColor="#667"
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setEditableTitle(album.title); 
                  setTitleModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleTitleSave}
              >
                <Text style={styles.modalSaveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

			{/* Modal para edição da descrição */}
      <Modal
        visible={descriptionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDescriptionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar descrição do álbum</Text>
            
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={editableDescription}
              onChangeText={setEditableDescription}
              placeholder="Digite a descrição do álbum"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setEditableDescription(album.description || ''); 
                  setDescriptionModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleDescriptionSave}
              >
                <Text style={styles.modalSaveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    height: 250,
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
  },
  coverGradient: {
    width: '100%',
    height: 250,
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
		width: '100%',
		maxWidth: '250',
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
		
  },
	albumCoverTitle: {
		width: '100%',
		maxWidth: '240',
		color: '#FFF',
		fontSize: 18,
		fontFamily: 'Poppins-SemiBold',
	},
  albumGrade: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
  ratingContainer: {
    flexDirection: 'row',
		columnGap: 5,
		position: 'absolute', 
		right: 0,
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
		paddingVertical: 5,
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
    width: '100%',
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
	deleteButton: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
	modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#031F2B',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    borderBottomWidth: 1,
		borderBottomColor: '#5EDFFF',
    color: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontFamily: 'Poppins-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#263238',
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#5EDFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  modalSaveButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#5EDFFF',
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#031F2B',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
	modalTextArea: {
    height: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#5EDFFF',
    borderRadius: 8,
    backgroundColor: '#0A2834',
  },
});

export default Album;