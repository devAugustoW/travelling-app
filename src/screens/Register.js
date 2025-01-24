import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '@env';
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

const Register = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const handleRegister = async () => {
    try {
      // Validações básicas
      if (!name.trim() || !email.trim() || !password.trim()) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos');
        return;
      }

      setLoading(true);

      const response = await axios.post(`${API_URL}/user`, {
        name,
        email,
        password
      });

      if (response.status === 201) {
        Alert.alert('Sucesso', 
          response.data.message,
          [{
						text: 'OK',
						onPress: () => navigation.navigate('Login')
          }]
        );
      }

    } catch (error) {
      if (error.response?.status === 400) {
        Alert.alert('Erro', error.response.data.error);
      } else {
        Alert.alert('Erro', 'Erro ao realizar cadastro. Tente novamente.');
      }
      console.log('Erro detalhado:', error.response?.data);
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
          <Text style={styles.title}>Criar Conta</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Digite seu nome"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              placeholderTextColor="#666"
              secureTextEntry
            />
          </View>

          <View style={styles.buttonContainer}>
					<TouchableOpacity 
              style={[
                styles.button,
                loading && styles.buttonDisabled
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.loginButton]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.buttonText, styles.loginButtonText]}>
                Já tenho uma conta
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
  content: {
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
    textAlign: 'center',
		marginBlock: 30,
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
		marginTop: 30,
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
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5EDFFF',
  },
  loginButtonText: {
    color: '#5EDFFF',
  }
});

export default Register;