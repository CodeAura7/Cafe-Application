import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {MenuButton} from '../components/MenuButton';
import type {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({navigation}: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <MenuButton label="New Order" onPress={() => navigation.navigate('NewOrder')} />
      <MenuButton label="Tables" onPress={() => navigation.navigate('Tables')} />
      <MenuButton label="Bill History" onPress={() => navigation.navigate('BillHistory')} />
      <MenuButton label="Day End Report" onPress={() => navigation.navigate('DayEndReport')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, gap: 12, padding: 16},
});
