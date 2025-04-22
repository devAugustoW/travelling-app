import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, GOOGLE_MAPS_API_KEY } from '@env';

const InputAlbumLocation = ({ route, navigation }) => {
  const { albumId, onLocationSaved } = route.params;
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      const userToken = await AsyncStorage.getItem('@auth_token');
      setToken(userToken);
    };
    getToken();
  }, []);

  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      Alert.alert('Erro', 'Selecione uma localização primeiro');
      return;
    }

    setLoading(true);

    try {
      // requisição para atualizar a localização do álbum
      await axios.patch(
        `${API_URL}/albums/${albumId}/location`,
        {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // função de callback para atualizar o estado no Album.js
      if (onLocationSaved) {
        onLocationSaved();
      }

      setLoading(false);
      Alert.alert(
        'Sucesso', 
        'Localização do álbum atualizada com sucesso!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Erro ao salvar localização:', error);
      setLoading(false);
      
      // exibe mensagem de erro
      const errorMessage = error.response?.data?.message || 'Não foi possível salvar a localização. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Localização do Álbum</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Buscar localização"
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details) {
              setSelectedLocation({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                name: data.description,
              });
            }
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'pt-BR',
          }}
          enablePoweredByContainer={false}
          styles={{
            container: {
              flex: 0,
            },
            textInput: {
              height: 45,
              color: '#5d5d5d',
              fontSize: 16,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              paddingHorizontal: 10,
            },
            predefinedPlacesDescription: {
              color: '#1faadb',
            },
            listView: {
              backgroundColor: '#FFF',
              borderRadius: 5,
              marginTop: 5,
            },
            row: {
              padding: 13,
              height: 'auto',
              backgroundColor: '#FFF',
            },
            description: {
              color: '#333',
            },
          }}
        />
      </View>

      {selectedLocation && (
        <View style={styles.selectedLocationContainer}>
          <Text style={styles.selectedLocationTitle}>Local selecionado:</Text>
          <View style={styles.locationCard}>
            <Feather name="map-pin" size={20} color="#5EDFFF" style={styles.locationIcon} />
            <Text style={styles.locationText}>{selectedLocation.name}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.saveButton,
          !selectedLocation && styles.saveButtonDisabled
        ]}
        onPress={handleSaveLocation}
        disabled={loading || !selectedLocation}
      >
        {loading ? (
          <ActivityIndicator color="#031F2B" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar Localização</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031F2B',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
  },
  searchContainer: {
    marginBottom: 20,
  },
  selectedLocationContainer: {
    flex: 1,
    marginBottom: 20,
  },
  selectedLocationTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 10,
  },
  locationCard: {
    backgroundColor: '#263238',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 10,
  },
  locationText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#5EDFFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(94, 223, 255, 0.5)',
  },
  saveButtonText: {
    color: '#031F2B',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
});

export default InputAlbumLocation;