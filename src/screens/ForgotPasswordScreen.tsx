import React, {useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, TextInput} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {getRecoveryQuestions, resetPassword} from '../services/LocalAuthService';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;
export function ForgotPasswordScreen({navigation}: Props): React.JSX.Element {
  const [userId, setUserId] = useState(''); const [questions, setQuestions] = useState<{one: string; two: string} | null>(null);
  const [answerOne, setAnswerOne] = useState(''); const [answerTwo, setAnswerTwo] = useState(''); const [password, setPassword] = useState('');
  const find = async () => { const result = await getRecoveryQuestions(userId); if (!result) Alert.alert('Account not found', 'Check the User ID.'); else setQuestions(result); };
  const reset = async () => { try { await resetPassword(userId, answerOne, answerTwo, password); Alert.alert('Password reset', 'You can now sign in with the new password.', [{text: 'Login', onPress: () => navigation.goBack()}]); } catch (error) { Alert.alert('Cannot reset password', error instanceof Error ? error.message : 'Please try again.'); } };
  return <ScrollView contentContainerStyle={styles.page}>
    <TextInput style={styles.input} placeholder="User ID" value={userId} onChangeText={setUserId} autoCapitalize="none" />
    {!questions ? <Pressable style={styles.button} onPress={() => void find()}><Text style={styles.buttonText}>Continue</Text></Pressable> : <>
      <Text style={styles.question}>{questions.one}</Text><TextInput style={styles.input} placeholder="Answer 1" value={answerOne} onChangeText={setAnswerOne} secureTextEntry />
      <Text style={styles.question}>{questions.two}</Text><TextInput style={styles.input} placeholder="Answer 2" value={answerTwo} onChangeText={setAnswerTwo} secureTextEntry />
      <TextInput style={styles.input} placeholder="New password (8+ characters, letter and number)" value={password} onChangeText={setPassword} secureTextEntry />
      <Pressable style={styles.button} onPress={() => void reset()}><Text style={styles.buttonText}>Reset Password</Text></Pressable>
    </>}
  </ScrollView>;
}
const styles = StyleSheet.create({page: {gap: 12, padding: 20}, input: {backgroundColor: '#fff', borderColor: '#94a3b8', borderRadius: 6, borderWidth: 1, color: '#111827', padding: 12}, question: {color: '#111827', fontWeight: '600', marginTop: 8}, button: {alignItems: 'center', backgroundColor: '#1d4ed8', borderRadius: 7, padding: 14}, buttonText: {color: '#fff', fontWeight: '700'}});
