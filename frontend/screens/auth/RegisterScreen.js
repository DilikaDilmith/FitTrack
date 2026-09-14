import React, { useState } from 'react';
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

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (
      fullName.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === ''
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    const result = await register({
      name: fullName,
      email,
      password,
    });
    setSubmitting(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.error);
    } else {
      navigation.replace('Login', { registeredEmail: email.trim().toLowerCase() });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Create Account</Text>
          <Text style={styles.subtitle}>Join FitTrack today</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
            editable={!submitting}
          />
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
            placeholder="Enter your password (min 6 chars)"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!submitting}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!submitting}
          />
        </View>

        <TouchableOpacity
          style={[styles.registerButton, submitting && styles.disabledButton]}
          onPress={handleRegister}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>REGISTER</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  headerText: { fontSize: 32, fontWeight: 'bold', color: '#2c3e50' },
  subtitle: { fontSize: 16, color: '#7f8c8d', marginTop: 5 },
  inputContainer: { marginBottom: 18 },
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
  registerButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: { opacity: 0.6 },
  registerButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  loginText: { color: '#7f8c8d', fontSize: 15 },
  loginLink: { color: '#27ae60', fontSize: 15, fontWeight: 'bold' },
});

export default RegisterScreen;