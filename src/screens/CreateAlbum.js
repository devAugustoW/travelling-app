import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '@env';
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
  TextInput,
  Image,
	Alert
} from 'react-native';

const CreateAlbum = () => {
  const [formData, setFormData] = useState({
    typeTrip: '',
		destination: '',
		title: '',
		tripActivity: '',
    difficulty: '',
    timeTravel: '',
		cost: '',
		description: '', 
		grade: '',
    hasArrived: false
  });
	const [isLoading, setIsLoading] = useState(false);
	const navigation = useNavigation();


	// Lista
  const tripTypes = [
    { label: 'Floresta', value: 'forest' },
    { label: 'Montanha', value: 'mountain' },
    { label: 'Praia', value: 'beach' },
    { label: 'Cidade', value: 'city' },
    { label: 'Trabalho', value: 'work' },
    { label: 'Trip', value: 'trip' },
  ];

	// Lista
	const tripActivities = [
    { label: 'Caminhada', value: 'Caminhada' },
    { label: 'Trilha', value: 'Trilha' },
    { label: 'Mergulho', value: 'Mergulho' },
    { label: 'Pedal', value: 'Pedal' },
    { label: 'Desafio', value: 'Desafio' }
  ];

	// Lista
  const difficulty = [
    { label: 'Fácil', value: 'Fácil' },
    { label: 'Médio', value: 'Médio' },
    { label: 'Difícil', value: 'Difícil' }
  ];

	// lista
  const timeTravel = [
    { label: '30 - 60min', value: '30 - 60min' },
    { label: '60 - 90min', value: '60 - 90min' },
    { label: '90min - 2h', value: '90min - 2h' },
    { label: '2h - 3h', value: '2h - 3h' },
    { label: '+3h', value: '+3h' }
  ];

	// lista
  const cost = [
		{ label: '1k', value: '1k' },
    { label: '1k - 3k', value: '1k - 3k' },
    { label: '3k - 5k', value: '3k - 5k' },
    { label: '5K -10k', value: '5K -10k' },
		{ label: '+10k', value: '+10k' }
  ];

	// pega a localização do usuário
	const getLocation = async () => {
    try {
      // Solicita permissão para acessar a localização
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Precisamos da sua localização para realizar o check in no destino.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Obtém a localização atual
      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

    } catch (error) {
      console.log('Erro ao obter localização:', error);
      Alert.alert(
        'Erro',
        'Não foi possível obter sua localização.',
        [{ text: 'OK' }]
      );

      return null;
    }
  };

	// criar álbum
	const handleCreateAlbum = async () => {
		setIsLoading(true);
    try {
      // Pega o token do AsyncStorage
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        Alert.alert('Erro', 'Você precisa estar logado');
        return;
      }

      // Valida campos obrigatórios
      if (!formData.typeTrip || !formData.destination || !formData.title) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
        return;
      }

			// prepara a localização
			let locationData = {
        latitude: 0,
        longitude: 0
      };

			// Se já chegou no destino, captura a localização
      if (formData.hasArrived) {
        const currentLocation = await getLocation();
        if (!currentLocation) {
          return;
        }
        locationData = currentLocation;
      }

      // Prepara os dados para envio
      const albumData = {
				typeTrip: formData.typeTrip || undefined,
				destination: formData.destination || undefined,
				title: formData.title || undefined,
				tripActivity: formData.tripActivity || undefined,
				difficulty: formData.difficulty || undefined, 
				timeTravel: formData.timeTravel || undefined, 
				cost: formData.cost || undefined, 
				description: formData.description || undefined,
				grade: 0,
				location: locationData
      };

			// Remove campos undefined antes de enviar
			Object.keys(albumData).forEach(key => {
				if (albumData[key] === undefined) {
					delete albumData[key];
				}
			});

      // Faz a requisição para criar o álbum
      const response = await axios.post(
        `${API_URL}/albums`,
        albumData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      Alert.alert(
        'Sucesso',
        'Álbum criado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpa o formulário
              setFormData({
								typeTrip: '',
								destination: '',
								title: '',
								tripActivity: '',
								difficulty: '',
								timeTravel: '',
								cost: '',
								description: '',
								hasArrived: false
              });
              // Navega para a tela Album
              navigation.navigate('Album', { albumId: response.data.album._id });
      			}
          }
        ]
      );

    } catch (error) {
      console.log('Erro ao criar álbum:', error.response?.data || error);
      let errorMessage = 'Erro ao criar álbum';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Erro', errorMessage);
			
    } finally {
      setIsLoading(false);

    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
				{/* Header com título e imagem */}
        <View style={styles.header}>
          <Text style={styles.title}>Vamos criar um novo Álbum?</Text>
          <Image 
            source={require('../assets/images/img-get-start.png')} 
            style={styles.headerImage}
          />
        </View>

				{/* Seleção do Tipo de viagem */}
        <Text style={styles.sectionTitle}>Que tipo de viagem você esta fazendo?</Text>
        <View style={styles.typeContainer}>
          {tripTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                formData.typeTrip === type.value && styles.typeButtonSelected
              ]}
              onPress={() =>setFormData(prev => ({...prev, typeTrip: type.value}))}
            >

              <Text style={[
                styles.typeButtonText,
                formData.typeTrip === type.value && styles.typeButtonTextSelected
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

				{/* seção de destino */}
        <Text style={styles.sectionTitle}>Para onde vamos?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Rio de Janeiro - RJ"
          placeholderTextColor="#667"
          value={formData.destination}
          onChangeText={(text) => setFormData(prev => ({ ...prev, destination: text }))}
        />

				{/* Título do álbum */}
        <Text style={styles.sectionTitle}>Como vamos chamar este álbum?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Cristo Redentor"
          placeholderTextColor="#667"
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
        />

				{/* Seção de atividades */}
				<View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Nesta viagem haverá:</Text>
            {tripActivities.map((activity) => (
              <TouchableOpacity
                key={activity.value}
                style={styles.checkboxContainer}
                onPress={() => setFormData(prev => ({ 
                  ...prev, 
                  tripActivity: activity.value 
                }))}
              >
                <View style={[
                  styles.checkbox,
                  formData.tripActivity === activity.value && styles.checkboxSelected
                ]} />
                <Text style={styles.checkboxLabel}>{activity.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

					{/* Seção de dificuldade */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Dificuldade:</Text>
            {difficulty.map((difficultyItem) => (
              <TouchableOpacity
                key={difficultyItem.value}
                style={styles.checkboxContainer}
                onPress={() => setFormData(prev => ({ 
                  ...prev, 
                  difficulty: difficultyItem.value 
                }))}
              >
                <View style={[
                  styles.checkbox,
                  formData.difficulty === difficultyItem.value && styles.checkboxSelected
                ]} />
                <Text style={styles.checkboxLabel}>{difficultyItem.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

				{/* Seção de tempo de viagem */}
        <Text style={styles.sectionTitle}>Tempo aproximado</Text>
        {timeTravel.map((duration) => (
          <TouchableOpacity
            key={duration.value}
            style={styles.checkboxContainer}
            onPress={() => setFormData(prev => ({ 
              ...prev, 
              timeTravel: duration.value 
            }))}
          >
            <View style={[
              styles.checkbox,
              formData.timeTravel === duration.value && styles.checkboxSelected
            ]} />
            <Text style={styles.checkboxLabel}>{duration.label}</Text>
          </TouchableOpacity>
        ))}

				{/* Seção de custo */}
        <Text style={styles.sectionTitle}>Ticket médio</Text>
        {cost.map((costItem) => (
          <TouchableOpacity
            key={costItem.value}
            style={styles.checkboxContainer}
            onPress={() => setFormData(prev => ({ 
              ...prev, 
              cost: costItem.value 
            }))}
          >
            <View style={[
              styles.checkbox,
              formData.cost === costItem.value && styles.checkboxSelected
            ]} />
            <Text style={styles.checkboxLabel}>{costItem.label}</Text>
          </TouchableOpacity>
        ))}

				{/* Seção de descrição */}
        <Text style={styles.sectionTitle}>Você quer descrever algo sobre a viagem agora?</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva sua viagem..."
          placeholderTextColor="#667"
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
        />

				{/* Seção de chegada no destino */}
        <Text style={styles.sectionTitle}>
          Você já chegou no <Text style={styles.highlightText}>seu Destino</Text>?
        </Text>
        <View style={styles.arrivedContainer}>
          <TouchableOpacity
            style={[
              styles.arrivalButton,
              formData.hasArrived && styles.arrivalButtonSelected
            ]}
            onPress={() => setFormData(prev => ({ ...prev, hasArrived: true }))}
          >
            <Text style={styles.arrivalButtonText}>Sim</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.arrivalButton,
              !formData.hasArrived && styles.arrivalButtonSelected
            ]}
            onPress={() => setFormData(prev => ({ ...prev, hasArrived: false }))}
          >
            <Text style={styles.arrivalButtonText}>Não</Text>
          </TouchableOpacity>
        </View>

				{/* Botão de criar álbum */}		
				<View style={styles.createButtonContainer}>
					<TouchableOpacity 
						style={styles.createButton}
						onPress={handleCreateAlbum}
						disabled={isLoading}
					>
						<Text style={styles.createButtonText}>
							{isLoading ? 'Criando...' : 'Criar Álbum'}
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
    padding: 20,
    backgroundColor: '#031F2B',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
		marginBottom: 20,
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
		marginBottom: 15,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  typeButton: {
    minWidth: '30%',
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#5EDFFF',
    backgroundColor: '#263238',
  },
  typeButtonSelected: {
    backgroundColor: '#5EDFFF',
  },
  typeButtonText: {
    textAlign: 'center',
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  typeButtonTextSelected: {
    color: '#031F2B',
  },
  input: {
    minHeight: 50,
    marginTop: -10,
    marginBottom: 20,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#5EDFFF',
    backgroundColor: '#263238',
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
    textAlignVertical: 'center',
    outlineStyle: 'none',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
		gap: 30,
    marginTop: 10,
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#5EDFFF',
  },
  checkboxSelected: {
    backgroundColor: '#5EDFFF',
  },
  checkboxLabel: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    lineHeight: 23,
  },
  highlightText: {
    color: '#5EDFFF',
  },
  arrivedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arrivalButton: {
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#5EDFFF',
  },
  arrivalButtonSelected: {
    backgroundColor: '#5EDFFF',
  },
  arrivalButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  createButtonContainer: {
    marginTop: 20,
    marginBottom: 0,
  },
  createButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#5EDFFF',
  },
  createButtonText: {
    textAlign: 'center',
    color: '#031F2B',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default CreateAlbum;