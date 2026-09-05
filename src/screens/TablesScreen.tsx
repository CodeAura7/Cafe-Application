import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import type {CafeTable} from '../types';
import type {RootStackParamList} from '../navigation/types';

import {listTables} from '../repositories/tablesRepository';
import {
  getActiveOrderForTable,
  startTableOrder,
} from '../services';

type Props = NativeStackScreenProps<RootStackParamList, 'Tables'>;

export function TablesScreen({
  navigation,
}: Props): React.JSX.Element {
  const [tables, setTables] = useState<CafeTable[]>([]);

  const load = useCallback(
    async () => setTables(await listTables()),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const select = async (table: CafeTable) => {
    try {
      if (table.status === 'OCCUPIED') {
        const order = await getActiveOrderForTable(table.id);

        if (!order) {
          throw new Error(
            'No active order was found for this table.',
          );
        }

        navigation.navigate('NewOrder', {
          tableId: table.id,
          activeOrderId: order.id,
        });

        return;
      }

      const order = await startTableOrder(table.id);

      navigation.navigate('NewOrder', {
        tableId: table.id,
        activeOrderId: order.id,
      });
    } catch (error) {
      Alert.alert(
        'Cannot open table',
        error instanceof Error
          ? error.message
          : 'Please try again.',
      );

      await load();
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.help}>
        Tap an available table to start an order.
        Occupied tables reopen their active order.
      </Text>

      <FlatList
        data={tables}
        numColumns={2}
        keyExtractor={item => String(item.id)}
        onRefresh={() => void load()}
        refreshing={false}
        renderItem={({item}) => (
          <Pressable
            style={[
              styles.table,
              item.status === 'OCCUPIED' &&
                styles.occupied,
            ]}
            onPress={() => void select(item)}>
            <Text style={styles.number}>
              Table {item.tableNumber}
            </Text>

            <Text style={styles.status}>
              {item.status === 'AVAILABLE'
                ? 'Available'
                : 'Occupied'}
            </Text>

            {!!item.customerName && (
              <Text style={styles.customer}>{item.customerName}</Text>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 12,
  },

  help: {
    color: '#475569',
    marginVertical: 10,
  },

  table: {
    backgroundColor: '#bbf7d0',
    borderRadius: 8,
    flex: 1,
    margin: 5,
    minHeight: 110,
    padding: 16,
  },

  occupied: {
    backgroundColor: '#fecaca',
  },

  number: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },

  status: {
    color: '#111827',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },

  customer: {color: '#334155', fontSize: 14, marginTop: 6},
});
