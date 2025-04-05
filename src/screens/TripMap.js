import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

const TripMap = ({ route, navigation }) => {
  const { albumId, albumTitle } = route.params;
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = React.useRef(null);
  
  // Função para simplificar nameLocation (mesma função usada em NewPhoto e Post)
  const simplifyLocationName = (fullLocation) => {
    if (!fullLocation) return '';
    
    // Primeiro substituimos hífens por vírgulas para uniformizar o processamento
    const normalizedLocation = fullLocation.replace(/ - /g, ', ');
    
    // Dividir por vírgulas
    const parts = normalizedLocation.split(',');
    
    // Se tiver menos de 2 partes, retorna o texto original
    if (parts.length < 2) return fullLocation;
    
    // Retorna apenas as duas primeiras partes
    return `${parts[0].trim()}, ${parts[1].trim()}`;
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      
      // Busca o token no AsyncStorage
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        Alert.alert('Erro', 'Você precisa estar logado para ver o mapa');
        navigation.goBack();
        return;
      }

      // Busca as localizações dos posts do álbum
      const response = await axios.get(
        `${API_URL}/albums/${albumId}/locations`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Verifica se retornou localizações
      if (response.data.locations && response.data.locations.length > 0) {
        setLocations(response.data.locations);
      } else {
        Alert.alert(
          'Sem localizações', 
          'Não há posts com localização neste álbum',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }

    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
      Alert.alert('Erro', 'Não foi possível carregar o mapa de viagem');
    } finally {
      setLoading(false);
    }
  };

  // Calcula a região inicial do mapa para mostrar todas as localizações
  const getInitialRegion = () => {
    if (locations.length === 0) {
      // Região padrão (Brasil)
      return {
        latitude: -15.7801,
        longitude: -47.9292,
        latitudeDelta: 40,
        longitudeDelta: 40
      };
    }

    if (locations.length === 1) {
      // Se só tem uma localização, centraliza nela
      return {
        latitude: locations[0].location.latitude,
        longitude: locations[0].location.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1
      };
    }

    // Calcula os limites do mapa para incluir todas as localizações
    let minLat = locations[0].location.latitude;
    let maxLat = locations[0].location.latitude;
    let minLng = locations[0].location.longitude;
    let maxLng = locations[0].location.longitude;

    locations.forEach(item => {
      minLat = Math.min(minLat, item.location.latitude);
      maxLat = Math.max(maxLat, item.location.latitude);
      minLng = Math.min(minLng, item.location.longitude);
      maxLng = Math.max(maxLng, item.location.longitude);
    });

    // Calcula o centro
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calcula o delta com um pouco de margem
    const latDelta = (maxLat - minLat) * 1.5 + 0.01;
    const lngDelta = (maxLng - minLng) * 1.5 + 0.01;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta
    };
  };

  const navigateToPost = (postId) => {
    navigation.navigate('Post', { postId, albumId });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5EDFFF" />
        <Text style={styles.loadingText}>Carregando mapa de viagem...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Map</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={getInitialRegion()}
          showsUserLocation={true}
          showsCompass={true}
        >
          {locations.map((item, index) => (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.location.latitude,
                longitude: item.location.longitude
              }}
              title={item.title}
              description={item.nameLocation}
              pinColor="#5EDFFF"
              onPress={() => setSelectedLocation(item)}
            >
              <Callout tooltip onPress={() => navigateToPost(item.id)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{item.title}</Text>
                  <Text style={styles.calloutSubtitle}>
                    {simplifyLocationName(item.nameLocation)}
                  </Text>
                  <Text style={styles.calloutAction}>Toque para ver detalhes</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>

      <View style={styles.locationsListContainer}>
        <Text style={styles.locationsTitle}>Locais visitados</Text>
        <ScrollView style={styles.locationsList}>
          {locations.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.locationItem,
                selectedLocation?.id === item.id && styles.selectedLocation
              ]}
              onPress={() => {
                setSelectedLocation(item);
                mapRef.current?.animateToRegion({
                  latitude: item.location.latitude,
                  longitude: item.location.longitude,
                  latitudeDelta: 0.31,
                  longitudeDelta: 0.31
                }, 1000);
              }}
            >
              <View style={styles.locationIcon}>
                <Feather name="map-pin" size={18} color="#5EDFFF" />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>{item.title}</Text>
                <Text style={styles.locationName}>
                  {simplifyLocationName(item.nameLocation)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigateToPost(item.id)}
              >
                <Feather name="eye" size={20} color="#5EDFFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031F2B',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#031F2B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Poppins-Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#263238',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
  },
  mapContainer: {
    flex: 1,
    height: '60%',
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  calloutContainer: {
    width: 200,
    backgroundColor: 'rgba(38, 50, 56, 0.95)',
    borderRadius: 8,
    padding: 10,
  },
  calloutTitle: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
  },
  calloutSubtitle: {
    color: '#B1AEAE',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginBottom: 6,
  },
  calloutAction: {
    color: '#5EDFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginTop: 5,
  },
  locationsListContainer: {
    height: '40%',
    padding: 16,
  },
  locationsTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 10,
  },
  locationsList: {
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    backgroundColor: '#263238',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  selectedLocation: {
    backgroundColor: '#3A454B',
    borderColor: '#5EDFFF',
    borderWidth: 1,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#031F2B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  locationName: {
    color: '#B1AEAE',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  viewButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TripMap;