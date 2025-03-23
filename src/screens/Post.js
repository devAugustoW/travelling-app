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
	Modal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EditModal from '../components/EditModal';
import RatingModal from '../components/RatingModal';

const Post = ({ route, navigation }) => {
  const { postId, albumId } = route.params;
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCover, setIsCover] = useState(false);
  const [loading, setLoading] = useState(true);
	const [isTitleModalVisible, setTitleModalVisible] = useState(false);
	const [isDescriptionModalVisible, setDescriptionModalVisible] = useState(false)
	const [editableTitle, setEditableTitle] = useState(title);
	const [editableDescription, setEditableDescription] = useState(description);
	const [isModalVisible, setModalVisible] = useState(false); 
	const [isLocationModalVisible, setLocationModalVisible] = useState(false);
	const [grade, setGrade] = useState(0);
	const [nameLocation, setNameLocation] = useState('');
	const [location, setLocation] = useState(null);

	// careega os dados do Post
  useEffect(() => {
    fetchPost();
  }, []);

	// função para buscar os dados do Post
  const fetchPost = async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const response = await axios.get(`${API_URL}/posts/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPost(response.data);
      setTitle(response.data.title);
      setDescription(response.data.description);
      setIsCover(response.data.cover);
			setGrade(response.data.grade || 0);
			setNameLocation(response.data.nameLocation || '');
			setLocation(response.data.location || null);

    } catch (error) {
      console.error('Erro ao buscar post:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do post');

    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      await axios.patch(`${API_URL}/posts/${postId}`, {
        title,
        description,
        cover: isCover,
        grade,
        nameLocation,
        location
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      Alert.alert('Sucesso', 'Post atualizado com sucesso');
      navigation.goBack();

    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o post');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este post?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('@auth_token');
              await axios.delete(`${API_URL}/posts/${postId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
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

  if (loading || !post) {
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
						<TextInput
							style={styles.titleInput}
							value={title}
							editable={false}
							placeholder="Título do post"
							placeholderTextColor="#B1AEAE"
						/>
					</TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)}> 
            <View style={styles.ratingContainer}>
              <Text style={styles.grade}>{parseFloat(grade).toFixed(1)}</Text>
              <Feather name="star" size={24} color="#FFD700" />
            </View>
          </TouchableOpacity>
        </View>
        
        {post.nameLocation ? (
          <TouchableOpacity onPress={() => setLocationModalVisible(true)}>
						<View style={styles.locationContainer}>
							<Feather name="map-pin" size={20} color="#FFFFFF" />
							<Text style={styles.locationText}>{post.nameLocation}</Text>
						</View>
					</TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.addLocationButton}
            onPress={() => navigation.navigate('InputPhotoLocation', { postId })}
          >
            <Feather name="map-pin" size={20} color="#FFFFFF" />
            <Text style={styles.addLocationText}>Adicionar localização</Text>
          </TouchableOpacity>
        )}
      </View>

			{/* Modal de confirmação de edição de localização */}
      <Modal
        visible={isLocationModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar localização?</Text>
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
                  navigation.navigate('InputPhotoLocation', { postId });
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
        source={{ uri: post.imagem }}
        style={styles.postImage}
        resizeMode="cover"
      />

      {/* Descrição */}
      <TouchableOpacity onPress={() => setDescriptionModalVisible(true)}>
        <TextInput
          style={styles.descriptionInput}
          value={description}
          editable={false}
          placeholder="Descrição do post"
          placeholderTextColor="#B1AEAE"
          multiline
        />
      </TouchableOpacity>

      {/* Mapa */}
      {post.location && (
        <>
          <Text style={styles.mapTitle}>No mapa</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: post.location.latitude,
                longitude: post.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: post.location.latitude,
                  longitude: post.location.longitude,
                }}
              />
            </MapView>
          </View>
        </>
      )}

      {/* Data */}
      <View style={styles.dateContainer}>
        <Feather name="map" size={20} color="#5EDFFF" />
        <Text style={styles.dateText}>
          {format(new Date(post.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </Text>
      </View>

      {/* Capa do Álbum */}
      <View style={styles.coverContainer}>
        <Text style={styles.coverTitle}>Capa do Álbum</Text>
        <View style={styles.coverOptions}>
          <TouchableOpacity 
            style={[styles.coverOption, isCover && styles.coverOptionSelected]}
            onPress={() => setIsCover(true)}
          >
            <Text style={styles.coverOptionText}>Sim</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.coverOption, !isCover && styles.coverOptionSelected]}
            onPress={() => setIsCover(false)}
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
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>

      {/* Botão Excluir */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Text style={styles.deleteButtonText}>Excluir Post</Text>
      </TouchableOpacity>

			{/* Rating Modal */}
      <RatingModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(newRating) => setGrade(newRating)}
        initialRating={grade}
      />

			{/* Edit Title Modal */}
      <EditModal
        visible={isTitleModalVisible}
        onClose={() => setTitleModalVisible(false)}
        onSave={() => {
          setTitle(editableTitle);
          setTitleModalVisible(false);
        }}
        value={editableTitle}
        setValue={setEditableTitle}
        title="Editar título da foto?"
      />

      {/* Edit Description Modal */}
      <EditModal
        visible={isDescriptionModalVisible}
        onClose={() => setDescriptionModalVisible(false)}
        onSave={() => {
          setDescription(editableDescription);
          setDescriptionModalVisible(false);
        }}
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
		marginTop: 10,
	},
	titleContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: 5,
	},
	titleInput: {
		flex: 1,
		color: '#FFF',
		fontSize: 20,
		lineHeight: 20,
		fontFamily: 'Poppins-SemiBold',
		paddingBottom: 0,
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
		color: '#ffffff',
		fontSize: 13,
		fontFamily: 'Poppins-SemiRegular',
		marginLeft: 5,
	},
	addLocationButton: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 10,
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
		height: 450,
		borderRadius: 10,
	},
	descriptionInput: {
		color: '#FFFFFF',
		fontSize: 14,
		fontFamily: 'Poppins-Regular',
		textAlignVertical: 'top',
		minHeight: 100,
	},
	mapTitle: {
		color: '#FFF',
		fontSize: 18 ,
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