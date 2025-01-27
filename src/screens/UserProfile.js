import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@env';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProfile = () => {
	
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    newPassword: '',
    trips: 24,
    distance: 220,
    views: '50K'
  });
	const [loading, setLoading] = useState(false);

	// resgata os dados do usuário ao carregar a tela
  useEffect(() => {
    loadUserData();
  }, []);

	// resgata os dados no AsyncStorage
  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('@user_data');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserData(prevState => ({
          ...prevState,
          name: userData.name,
          email: userData.email
        }));
      }
    } catch (error) {
      console.log('Erro ao carregar dados do usuário:', error);
    }
  };

	// atualiza os dados do usuário
	const handleUpdate = async () => {
    try {
      setLoading(true);

      // pega o token do AsyncStorage
      const token = await AsyncStorage.getItem('@auth_token');
			const userDataString = await AsyncStorage.getItem('@user_data');
			const storedUserData = JSON.parse(userDataString);
    	const userId = storedUserData._id;


    	if (!token || !userId) {
				Alert.alert('Erro', 'Você precisa estar logado');
				return;
    	}

      // prepara os dados para atualização
      const updateData = {};
      
			// adiciona nome se foi alterado
			if (userData.name && userData.name !== storedUserData.name) {
				updateData.name = userData.name;
			}

      // adiciona senhas se foram preenchidas
      if (userData.newPassword) {
        if (!userData.currentPassword) {
          Alert.alert('Erro', 'Senha atual é necessária para alterar a senha');
          return;
        }
        updateData.oldPassword = userData.currentPassword;
        updateData.password = userData.newPassword;
      }

      // se não há dados para atualizar
      if (Object.keys(updateData).length === 0) {
        Alert.alert('Aviso', 'Nenhuma alteração para salvar');
        return;
      }

      // Faz a requisição de atualização
      const response = await axios.put(
        `${API_URL}/user/${userId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // atualiza os dados no AsyncStorage
      await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));

      // Limpa os campos de senha
      setUserData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: ''
      }));

      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');

    } catch (error) {
      let errorMessage = 'Erro ao atualizar dados';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert('Erro', errorMessage);

    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Editar Perfil</Text>

      <View style={styles.profileImageContainer}>
        <Image
          source={require('../assets/images/profile.jpg')}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.cameraButton}>
          <Feather name="camera" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.userName}>{userData.name}</Text>
      <Text style={styles.userEmail}>{userData.email}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userData.trips}</Text>
          <Text style={styles.statLabel}>Viagens</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userData.distance}</Text>
          <Text style={styles.statLabel}>Km percorrido</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userData.views}</Text>
          <Text style={styles.statLabel}>Viagens</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={userData.name}
          onChangeText={(text) => setUserData({...userData, name: text})}
          placeholderTextColor="#fff"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={userData.email}
          editable={false}
          placeholderTextColor="#fff"
        />

				<Text style={styles.label}>Senha Corrente</Text>
        <TextInput
          style={styles.input}
          value={userData.currentPassword}
          onChangeText={(text) => setUserData({...userData, currentPassword: text})}
          secureTextEntry
          placeholderTextColor="#fff"
        />

				<Text style={styles.label}>Nova Senha</Text>
				<TextInput
          style={styles.input}
          value={userData.newPassword}
          onChangeText={(text) => setUserData({...userData, newPassword: text})}
          secureTextEntry
          placeholderTextColor="#fff"
        />

				<TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar'}
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
    backgroundColor: '#031F2B',
    padding: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: 10,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    backgroundColor: '#5EDFFF',
  },
  cameraButton: {
    position: 'absolute',
    right: '25%',
    bottom: 0,
    backgroundColor: '#5EDFFF',
    padding: 8,
    borderRadius: 20,
  },
  userName: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#5EDFFF',
    fontSize: 34,
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
		marginTop: -10,
  },
  formContainer: {
    flex: 1,
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#263238',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
		borderColor: '#5EDFFF',
		borderWidth: 1,
  },
  saveButton: {
    backgroundColor: '#5EDFFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
		marginBottom: 60,
  },
  saveButtonText: {
    color: '#031F2B',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
	saveButtonDisabled: {
    opacity: 0.7,
  },

});

export default UserProfile;