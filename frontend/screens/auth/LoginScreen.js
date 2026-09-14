import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Alert from '../../components/FitAlert';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState(route?.params?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (route?.params?.registeredEmail) {
      setEmail(route.params.registeredEmail);
    }
  }, [route?.params?.registeredEmail]);

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>💪</Text>
          <Text style={styles.appName}>FitTrack</Text>
          <Text style={styles.subtitle}>Your Fitness Partner</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!submitting}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!submitting}
          />
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, submitting && styles.disabledButton]}
          onPress={handleLogin}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoText: { fontSize: 60 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#2c3e50', marginTop: 5 },
  subtitle: { fontSize: 16, color: '#7f8c8d', marginTop: 5 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 30 },
  forgotPasswordText: { color: '#3498db', fontSize: 14 },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: { opacity: 0.6 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  registerText: { color: '#7f8c8d', fontSize: 15 },
  registerLink: { color: '#3498db', fontSize: 15, fontWeight: 'bold' },
});

export default LoginScreen;