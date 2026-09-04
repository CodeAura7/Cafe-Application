import React from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {MenuButton} from '../components/MenuButton';
import {useAuth} from '../auth/AuthContext';
import type {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({navigation}: Props): React.JSX.Element {
  const {logout} = useAuth();

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: logout},
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.section}>Menu Management</Text>
      <MenuButton label="Products / Menu" onPress={() => navigation.navigate('Products')} />

      <Text style={styles.section}>Hardware</Text>
      <MenuButton label="Printer" onPress={() => navigation.navigate('Printer')} />

      <Text style={styles.section}>Account</Text>
      <MenuButton label="Logout" onPress={confirmLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, gap: 12, padding: 16},
  section: {
    color: '#4b5563',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 8,
    textTransform: 'uppercase',
  },
});
