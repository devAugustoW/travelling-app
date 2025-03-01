import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const Album = ({ route }) => {
  const { album } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Área da capa */}
        {album?.cover ? (
          <Image 
            source={{ uri: album.cover }} 
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#031F2B', '#5EDFFF']}
            style={styles.coverGradient}
          />
        )}

        {/* Ícones de informação */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Feather name="trending-up" size={24} color="#5EDFFF" />
            <Text style={styles.infoTitle}>Dificuldade</Text>
            <Text style={styles.infoText}>{album?.difficulty || 'N/A'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Feather name="clock" size={24} color="#5EDFFF" />
            <Text style={styles.infoTitle}>Tempo de Viagem</Text>
            <Text style={styles.infoText}>{album?.timeTravel || 'N/A'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Feather name="tag" size={24} color="#5EDFFF" />
            <Text style={styles.infoTitle}>Ticket</Text>
            <Text style={styles.infoText}>{album?.cost || 'N/A'}</Text>
          </View>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Sobre */}
        <View style={styles.aboutContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{album?.description || 'Sem descrição'}</Text>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Mapa */}
        <View style={styles.mapContainer}>
          <Text style={styles.sectionTitle}>No mapa</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: album?.location?.latitude || -22.9068,
              longitude: album?.location?.longitude || -43.1729,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: album?.location?.latitude || -22.9068,
                longitude: album?.location?.longitude || -43.1729,
              }}
            />
          </MapView>
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.tripMapButton}>
            <Feather name="map" size={20} color="#5EDFFF" />
            <Text style={styles.buttonText}>Trip Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.photoButton}>
            <Text style={[styles.buttonText, styles.photoButtonText]}>Foto</Text>
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
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  coverGradient: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  infoItem: {
    alignItems: 'center',
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
    marginBottom: 10,
  },
  description: {
    color: '#B1AEAE',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  mapContainer: {
    padding: 20,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
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