import React from 'react';
import axios from 'axios';
import { API_URL } from '@env';
import { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
  FlatList
} from 'react-native';

const Home = () => {
	const navigation = useNavigation();
	const [userData, setUserData] = useState(null);
	const [activeFilter, setActiveFilter] = useState('1');
	const [userAlbums, setUserAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
	

  const filters = [
    { id: '1', name: 'Forest', label: 'Floresta' },
    { id: '2', name: 'Mountains', label: 'Montanha' },
    { id: '3', name: 'Beach', label: 'Praia' },
    { id: '4', name: 'City', label: 'Cidade' },
    { id: '5', name: 'Diving', label: 'Mergulho' },
    { id: '6', name: 'Work', label: 'Trabalho' },
  ];

  const popularAlbums = [
    {
      id: '1',
      title: 'Mar Aberto',
      location: 'Ubatuba',
      image: require('../assets/images/praia.png'),
      time: '15 km away'
    },
    {
      id: '2',
      title: 'Monte Everest',
      location: 'Nepal',
      image: require('../assets/images/mountain.png'),
      time: '2 km away'
    },
		{
      id: '3',
      title: 'Praia da Barra',
      location: 'Rio de Janeiro',
      image: require('../assets/images/praia.png'),
      time: '2 km away'
    },
		{
      id: '4',
      title: 'Trilha na Mata',
      location: 'Chapada Diamantina',
      image: require('../assets/images/mountain.png'),
      time: '2 km away'
    },
  ];

	// recupera os dados no AsyncStorage
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

	// Busca os dados quando o componente é montado
	useEffect(() => {
		fetchUserAlbums();
	}, []);


  return (
    <SafeAreaView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<View>
					<Text style={styles.greeting}>Olá {userData?.name || 'User'}</Text>
						<Text style={styles.title}>Vamos viajar</Text>
					</View>
					<Image
						source={userData?.userImg
							? { uri: userData.userImg }
							: require('../assets/images/profile.jpg')}
						style={styles.profileImage}
					/>
				</View>

				{/* Pesquisa */}
				<View style={styles.searchContainer}>
					<TextInput
						style={styles.searchInput}
						placeholder="Pesquisa livre"
						placeholderTextColor="#664"
					/>
					<Feather name="search" size={20} color="#664" style={styles.searchIcon} />
				</View>

				{/* Filtro */}
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
							onPress={() => setActiveFilter(item.id)}
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
						data={popularAlbums}
						keyExtractor={(item) => item.id}
						style={styles.albumList} 
						renderItem={({ item }) => (
							<TouchableOpacity key={item.id} style={styles.albumCard}>
								<Image source={item.image} style={styles.albumImage} />
								<View style={styles.albumInfo}>
									<Text style={styles.albumTitle}>{item.title}</Text>
									<Text style={styles.albumTime}>{item.time}</Text>
								</View>
							</TouchableOpacity>
						)}
					/>
				</View>

				{/* Destinos */}
				<View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinos</Text>
          {userAlbums.map((album) => (
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
									<Text style={styles.rating}>{album.grade || '0.0'}</Text>
									<MaterialIcons name="star" size={24} color="#FFD700" />
								</View>
							</View>
						</TouchableOpacity>
					))}
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
    fontFamily: 'Poppins-Bold',
		marginTop: '-55px'
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
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Poppins-Regular',
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
  },
  albumImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  albumInfo: {
    padding: 10,
		position: 'absolute',
		bottom: 0,
		left: 0,
  },
  albumTitle: {
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
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
    marginBottom: 15,
    borderRadius: 8,
		marginBottom: 5,
		overflow: 'hidden',
		position: 'relative',
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
	featuredDestination: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
	featuredTitle: {
    color: '#ffffff',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
		marginTop: -10,
  },  
  ratingContainer: {
		flexDirection: 'row',
		gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rating: {
		fontSize: 20,
    color: '#ffffff',
    fontFamily: 'Poppins-SemiRegular',
  },
});

export default Home;