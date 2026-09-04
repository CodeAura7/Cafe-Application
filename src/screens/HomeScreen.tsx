import React, {useLayoutEffect} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {MenuButton} from '../components/MenuButton';
import type {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({navigation}: Props): React.JSX.Element {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileButtonText}>Profile / Settings</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

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
  profileButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  profileButtonText: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '600',
  },
});
