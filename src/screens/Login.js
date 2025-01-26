import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('camelo@email.com');
  const [password, setPassword] = useState('Camelo');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos');
        return;
      }

      setLoading(true);

      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });

			// Armazena o token e dados do usuário
      await AsyncStorage.setItem('@auth_token', response.data.token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));

			// redireciona para a tela home
      if (response.data) {
        setEmail('');
        setPassword('');
        navigation.navigate('Home');
      }

    } catch (error) {
			console.log('Erro completo:', error);
			console.log('Resposta de erro:', error.response?.data); 
	
			if (error.response?.status === 400) {
				Alert.alert('Erro', error.response.data.message);
			} else {
				Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
			}
		} finally {
			setLoading(false);
		}
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Login</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              placeholderTextColor="#666"
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.button,
                loading && styles.buttonDisabled
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.registerButton]}
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.registerButtonText]}>
                Criar uma conta
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031F2B',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 50,
  },
  inputContainer: {
    gap: 15,
    marginBottom: 30,
  },
  label: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    marginBottom: -5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  buttonContainer: {
    gap: 15,
    width: '100%',
    marginTop: 'auto',
  },
  button: {
    backgroundColor: '#5EDFFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#031F2B',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5EDFFF',
  },
  registerButtonText: {
    color: '#5EDFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  }
});

export default Login;