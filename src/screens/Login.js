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
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	// função para tratar erros
	const handleError = (error) => {
		const timestamp = new Date().toISOString();
		console.log(`[${timestamp}] Erro completo:`, error);

		if (error.response) {
			console.log(`[${timestamp}] Resposta de erro:`, error.response.data);
			console.log(`[${timestamp}] Status do erro:`, error.response.status);

			switch (error.response.status) {
				case 400:
					Alert.alert('Erro', error.response.data.message || 'Requisição inválida.');
					break;
				case 401:
					Alert.alert('Erro', 'Credenciais inválidas. Verifique seu email e senha.');
					break;
				case 500:
					Alert.alert('Erro', 'Erro interno do servidor. Tente novamente mais tarde.');
					break;
				default:
					Alert.alert('Erro', 'Erro desconhecido. Tente novamente.');
			}
		} else if (error.request) {
			console.log(`[${timestamp}] Erro de rede ou sem resposta do servidor:`, error.request);
			Alert.alert('Erro', 'Sem resposta do servidor. Verifique sua conexão de rede.');
		} else {
			console.log(`[${timestamp}] Erro ao configurar o pedido:`, error.message);
			Alert.alert('Erro', 'Erro ao configurar o pedido. Tente novamente.');
		}
	};

	// função para fazer login
	const handleLogin = async () => {
		try {
			// remove espaços vazios no inicio e no final, e verifica se campos estão vazios
			if (!email.trim() || !password.trim()) {
				Alert.alert('Erro', 'Por favor, preencha todos os campos');
				return;
			}

			setLoading(true);

			// faz a chamada de login no backend
			const response = await axios.post(`${API_URL}/login`, {
				email,
				password
			});

			// armazena o token e dados do usuário
			await AsyncStorage.setItem('@auth_token', response.data.token);
			await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));

			// redireciona para a tela home
			if (response.data) {
				setEmail('');
				setPassword('');
				navigation.navigate('Home');
			}

		} catch (error) {
			handleError(error);

		} finally {
			setLoading(false);
		}
	};

	// função para fazer login como visitante
	const handleLoginVisitor = async () => {
		try{
			setLoading(true);
         
			// chamada de login de visitante
			const response = await axios.post(`${API_URL}/login-visitor`);

			// armazena apenas o token (sem dados do usuário)
			await AsyncStorage.setItem('@auth_token', response.data.token);
			await AsyncStorage.setItem('@user_is_visitor', 'true');

			// busca os dados do usuário camelo
			const userResponse = await axios.get(`${API_URL}/user`, {
				headers: {
					'Authorization': `Bearer ${response.data.token}`
				}

			});

			// armazena os dados do usuário visitante
			await AsyncStorage.setItem('@user_data', JSON.stringify(userResponse.data.user));

			// redireciona para a tela home
			navigation.navigate('Home');

		} catch (error) {
			handleError(error);

		} finally {
			setLoading(false);

		}
	}

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

						<TouchableOpacity
							style={[styles.button, styles.visitorButton]}
							onPress={handleLoginVisitor}
							disabled={loading}
						>
							<Text style={[styles.buttonText, styles.visitorButtonText]}>
								Entrar como visitante
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
	},
	visitorButton: {
		backgroundColor: '#5EDFFF',
		borderWidth: 1,
		marginTop: 10,
	},
	visitorButtonText: {
		color: '#031F2B',
	},
});

export default Login;