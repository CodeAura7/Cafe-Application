import React, {useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {useAuth} from '../auth/AuthContext';
import type {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
export function LoginScreen({navigation}: Props): React.JSX.Element {
  const {login} = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    const success = await login(username, password);
    if (!success) {
      Alert.alert('Login failed', 'Incorrect username or password.');
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Cafe POS</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={() => void submit()}
      />

      <Pressable style={styles.button} onPress={() => void submit()}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('ForgotPassword')}><Text style={styles.forgot}>Forgot Password?</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f3f4f6',
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#4b5563',
    fontSize: 15,
    marginTop: 6,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#94a3b8',
    borderWidth: 1,
    borderRadius: 6,
    color: '#111827',
    marginBottom: 12,
    padding: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 7,
    marginTop: 8,
    padding: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  forgot: {color: '#1d4ed8', marginTop: 18, textAlign: 'center'},
});
