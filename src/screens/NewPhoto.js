import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';

const NewPhoto = ({ navigation }) => {
	const [selectedImage, setSelectedImage] = useState(null);
	const [galleryImages, setGalleryImages] = useState([]);

	// função para carregar as fotos da galeria
	useEffect(() => {
    const loadGalleryImages = async () => {
			let result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images', 'videos'],
				allowsEditing: true,
				aspect: [4, 3],
				quality: 1,
			});

      if (!result.canceled) {
        setGalleryImages(result.assets);
      }
    };

    loadGalleryImages();
  },);

	// função para abrir a câmera
	const openCamera = () => {
    ImagePicker.launchCameraAsync({ mediaType: 'photo' }).then((response) => {
      if (!response.canceled) {
        setSelectedImage(response.assets[0].uri);
      }
    });
  };

	return (
    <View style={styles.container}>
			{/* Header de New Photo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.title}>Nova Foto</Text>

        <TouchableOpacity onPress={() => {/* Avançar ação */}}>
          <Text style={styles.advance}>Avançar</Text>
        </TouchableOpacity>
      </View>

			{/* Área de preview da foto */}
      <View style={styles.imagePreview}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>Nenhuma foto selecionada</Text>
        )}
      </View>

			{/* Botões de seleção de foto */}	
      <View style={styles.actions}>
				<TouchableOpacity style={styles.galleryButton}>
          <Text style={styles.buttonText}>{selectedAlbum}</Text>
          <Feather name="chevron-down" size={20} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={openCamera} style={styles.cameraButton}>
          <Feather name="camera" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={galleryImages}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={styles.galleryImage} />
        )}
        horizontal
        style={styles.galleryList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031F2B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
		marginLeft: -120,
  },
  advance: {
    color: '#5EDFFF',
    fontSize: 16,
  },
  imagePreview: {
		height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    color: '#FFF',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#263238',
    padding: 10,
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
	galleryList: {
    flex: 1,
    padding: 10,
  },
  galleryImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
});

export default NewPhoto;