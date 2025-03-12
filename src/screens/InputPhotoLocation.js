import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Feather } from '@expo/vector-icons';
import { GOOGLE_MAPS_API_KEY } from '@env';
import 'react-native-get-random-values';

const InputPhotoLocation = ({ navigation, route }) => {
  const { updatePhotoData } = route.params;

  return (
    <View style={styles.container}>

			{/* Header */}
			<View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Selecione uma Localização</Text>
      </View>

      <GooglePlacesAutocomplete
        placeholder="Adicione uma localização..."
        textInputProps={{ placeholderTextColor: '#667' }}
        onPress={(data, details = null) => {
          updatePhotoData('nameLocation', data.description);
          updatePhotoData('location', {
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
          });
          navigation.goBack();
        }}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'pt-BR',
        }}
        styles={{
          textInput: styles.searchInput,
          listView: styles.listView,
        }}
        fetchDetails={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
		paddingHorizontal: 10,
    backgroundColor: '#031F2B',
  },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 10,
		marginBottom: 20,
	},
  title: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  searchInput: {
    color: '#5EDFFF',
		borderWidth: 1,
		borderColor: '#5EDFFF',
		backgroundColor: '#263238',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  listView: {
		backgroundColor: '#263238',
  },
});

export default InputPhotoLocation;