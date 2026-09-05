import React, {useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, TextInput} from 'react-native';
import {useAuth} from '../auth/AuthContext';
import {createAccount} from '../services/LocalAuthService';

export function AccountSetupScreen(): React.JSX.Element {
  const {refreshAccount} = useAuth();
  const [values, setValues] = useState({userId: '', password: '', questionOne: '', answerOne: '', questionTwo: '', answerTwo: ''});
  const set = (key: keyof typeof values) => (value: string) => setValues(old => ({...old, [key]: value}));
  const submit = async () => {
    try { await createAccount(values); await refreshAccount(); }
    catch (error) { Alert.alert('Cannot create account', error instanceof Error ? error.message : 'Please check the information.'); }
  };
  return <ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.text}>Create the local owner account for this tablet. Security answers are case-insensitive.</Text>
    <TextInput style={styles.input} placeholder="User ID" value={values.userId} onChangeText={set('userId')} autoCapitalize="none" />
    <TextInput style={styles.input} placeholder="Password (8+ characters, letter and number)" value={values.password} onChangeText={set('password')} secureTextEntry />
    <TextInput style={styles.input} placeholder="Security question 1" value={values.questionOne} onChangeText={set('questionOne')} />
    <TextInput style={styles.input} placeholder="Answer 1" value={values.answerOne} onChangeText={set('answerOne')} secureTextEntry />
    <TextInput style={styles.input} placeholder="Security question 2" value={values.questionTwo} onChangeText={set('questionTwo')} />
    <TextInput style={styles.input} placeholder="Answer 2" value={values.answerTwo} onChangeText={set('answerTwo')} secureTextEntry />
    <Pressable style={styles.button} onPress={() => void submit()}><Text style={styles.buttonText}>Create Account</Text></Pressable>
  </ScrollView>;
}
const styles = StyleSheet.create({page: {gap: 12, padding: 20}, text: {color: '#374151', lineHeight: 20}, input: {backgroundColor: '#fff', borderColor: '#94a3b8', borderRadius: 6, borderWidth: 1, color: '#111827', padding: 12}, button: {alignItems: 'center', backgroundColor: '#1d4ed8', borderRadius: 7, marginTop: 8, padding: 14}, buttonText: {color: '#fff', fontWeight: '700'}});
