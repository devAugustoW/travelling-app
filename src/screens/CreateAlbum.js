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
	const navigation = useNavigation();

  const [formData, setFormData] = useState({
    title: '',
		description: '', 
		destination: '',
    typeTrip: '',
    tripActivity: '',
    difficulty: '',
    timeTravel: '',
    cost: '',
		grade: '',
    hasArrived: false
  });

  const tripTypes = [
    { label: 'Floresta', value: 'forest' },
    { label: 'Montanha', value: 'mountain' },
    { label: 'Praia', value: 'beach' },
    { label: 'Cidade', value: 'city' },
    { label: 'Trabalho', value: 'work' },
    { label: 'Trip', value: 'trip' },
  ];

	const tripActivities = [
    { label: 'Caminhada', value: 'Caminhada' },
    { label: 'Trilha', value: 'Trilha' },
    { label: 'Mergulho', value: 'Mergulho' },
    { label: 'Pedal', value: 'Pedal' },
    { label: 'Desafio', value: 'Desafio' }
  ];

  const difficulties = [
    { label: 'Fácil', value: 'Fácil' },
    { label: 'Médio', value: 'Médio' },
    { label: 'Difícil', value: 'Difícil' }
  ];

  const durations = [
    { label: '30 - 60min', value: '30 - 60min' },
    { label: '60 - 90min', value: '60 - 90min' },
    { label: '90min - 2h', value: '90min - 2h' },
    { label: '2h - 3h', value: '2h - 3h' },
    { label: '+3h', value: '+3h' }
  ];

  const budgets = [
		{ label: '1k', value: '1k' },
    { label: '1k - 3k', value: '1k - 3k' },
    { label: '3k - 5k', value: '3k - 5k' },
    { label: '5K -10k', value: '5K -10k' },
		{ label: '+10k', value: '+10k' }
  ];

  const handleSelectType = (type) => {
    setFormData(prev => ({ ...prev, type }));
  };

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

	const handleCreateAlbum = async () => {
    try {
      // Pega o token do AsyncStorage
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        Alert.alert('Erro', 'Você precisa estar logado');
        return;
      }

      // Valida campos obrigatórios
      if (!formData.albumName || !formData.city || !formData.description) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
        return;
      }

			// prepara a localização
			let locationData = {
        latitude: 0,
        longitude: 0
      };

			// Se já chegou no destino, tenta obter a localização
      if (formData.hasArrived) {
        const currentLocation = await getLocation();
        if (!currentLocation) {
          return;
        }
        locationData = currentLocation;
      }

      // Prepara os dados para envio
      const albumData = {
        title: formData.albumName,
        description: formData.description,
        destination: formData.city,
				typeTrip: formData.type || undefined,
        tripActivity: formData.tripType || undefined,
        difficulty: formData.difficulty || undefined, 
        timeTravel: formData.duration || undefined, 
        cost: formData.budget || undefined, 
        grade: 0,
        location: locationData
      };

			// Remove campos undefined antes de enviar
			Object.keys(albumData).forEach(key => {
				if (albumData[key] === undefined) {
					delete albumData[key];
				}
			});

			console.log('Dados enviados:', albumData);

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
                type: '',
                city: '',
                albumName: '',
                tripType: '',
                difficulty: '',
                duration: '',
                budget: '',
                description: '',
                hasArrived: false
              });
              // Volta para a Home
              navigation.navigate('HomeTab');
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
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Vamos criar um novo Álbum?</Text>
          <Image 
            source={require('../assets/images/img-get-start.png')} 
            style={styles.headerImage}
          />
        </View>

        <Text style={styles.sectionTitle}>Que tipo de viagem você esta fazendo?</Text>
        
        <View style={styles.typeContainer}>
          {tripTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                formData.type === type.value && styles.typeButtonSelected
              ]}
              onPress={() => handleSelectType(type.value)}
            >
              <Text style={[
                styles.typeButtonText,
                formData.type === type.value && styles.typeButtonTextSelected
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Para onde vamos?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Rio de Janeiro - RJ"
          placeholderTextColor="#cccccc"
          value={formData.city}
          onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
        />

        <Text style={styles.sectionTitle}>Como vamos chamar este álbum?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Cristo Redentor"
          placeholderTextColor="#cccccc"
          value={formData.albumName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, albumName: text }))}
        />

				<View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Nesta viagem haverá:</Text>
            {tripActivities.map((activity) => (
              <TouchableOpacity
                key={activity.value}
                style={styles.checkboxContainer}
                onPress={() => setFormData(prev => ({ 
                  ...prev, 
                  tripType: activity.value 
                }))}
              >
                <View style={[
                  styles.checkbox,
                  formData.tripType === activity.value && styles.checkboxSelected
                ]} />
                <Text style={styles.checkboxLabel}>{activity.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Dificuldade:</Text>
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.value}
                style={styles.checkboxContainer}
                onPress={() => setFormData(prev => ({ 
                  ...prev, 
                  difficulty: difficulty.value 
                }))}
              >
                <View style={[
                  styles.checkbox,
                  formData.difficulty === difficulty.value && styles.checkboxSelected
                ]} />
                <Text style={styles.checkboxLabel}>{difficulty.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tempo aproximado</Text>
        {durations.map((duration) => (
          <TouchableOpacity
            key={duration.value}
            style={styles.checkboxContainer}
            onPress={() => setFormData(prev => ({ 
              ...prev, 
              duration: duration.value 
            }))}
          >
            <View style={[
              styles.checkbox,
              formData.duration === duration.value && styles.checkboxSelected
            ]} />
            <Text style={styles.checkboxLabel}>{duration.label}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Ticket médio</Text>
        {budgets.map((budget) => (
          <TouchableOpacity
            key={budget.value}
            style={styles.checkboxContainer}
            onPress={() => setFormData(prev => ({ 
              ...prev, 
              budget: budget.value 
            }))}
          >
            <View style={[
              styles.checkbox,
              formData.budget === budget.value && styles.checkboxSelected
            ]} />
            <Text style={styles.checkboxLabel}>{budget.label}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Você quer descrever algo sobre a viagem agora?</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva sua viagem..."
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
        />

        <Text style={styles.sectionTitle}>
          Você já chegou no <Text style={styles.highlightText}>seu Destino</Text>?
        </Text>
        <View style={styles.row}>
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

				<View style={styles.buttonContainer}>
					<TouchableOpacity 
						style={styles.createButton}
						onPress={handleCreateAlbum}
					>
						<Text style={styles.createButtonText}>Criar Álbum</Text>
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
    backgroundColor: '#263238',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#5EDFFF',
    minWidth: '30%',
  },
  typeButtonSelected: {
    backgroundColor: '#5EDFFF',
  },
  typeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  typeButtonTextSelected: {
    color: '#031F2B',
  },
	input: {
    backgroundColor: '#263238',
    borderRadius: 8,
		padding: 12,
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderColor: '#5EDFFF',
		minHeight: 50,
		textAlignVertical: 'center',
		outlineStyle: 'none',
		marginTop: -10,
		marginBottom: 20,
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
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#5EDFFF',
    marginRight: 10,
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
  },
  highlightText: {
    color: '#5EDFFF',
  },
  arrivalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5EDFFF',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  arrivalButtonSelected: {
    backgroundColor: '#5EDFFF',
  },
  arrivalButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 60,
  },
  createButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#5EDFFF',
  },
  createButtonText: {
    color: '#031F2B',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
});

export default CreateAlbum;