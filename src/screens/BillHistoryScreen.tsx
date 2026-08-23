import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {BillHistoryItem, OrderItem} from '../types';
import {listCompletedBills} from '../repositories/reportsRepository';
import {listOrderItems} from '../repositories/orderItemsRepository';

export function BillHistoryScreen(): React.JSX.Element {
  const [bills, setBills] = useState<BillHistoryItem[]>([]);
  const [selected, setSelected] = useState<BillHistoryItem | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  const load = useCallback(
    async () => setBills(await listCompletedBills()),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const open = async (bill: BillHistoryItem) => {
    setSelected(bill);
    setItems(await listOrderItems(bill.id));
  };

  return (
    <View style={styles.page}>
      <FlatList
        data={bills}
        keyExtractor={item => String(item.id)}
        onRefresh={() => void load()}
        refreshing={false}
        ListEmptyComponent={
          <Text style={styles.text}>
            No completed bills yet.
          </Text>
        }
        renderItem={({item}) => (
          <Pressable
            style={styles.card}
            onPress={() => void open(item)}>
            <Text style={styles.title}>
              Bill #{item.orderNumber} · ₹
              {item.finalTotal.toFixed(2)}
            </Text>

            <Text style={styles.text}>
              {item.customerName || 'Walk-in'}
              {item.tableNumber
                ? ` · Table ${item.tableNumber}`
                : ''}
            </Text>

            <Text style={styles.text}>
              {new Date(item.createdAt).toLocaleString()} ·
              {' '}Discount ₹{item.discount.toFixed(2)}
            </Text>
          </Pressable>
        )}
      />

      <Modal
        visible={!!selected}
        transparent
        animationType="slide">
        <View style={styles.modal}>
          <View style={styles.sheet}>
            {selected && (
              <>
                <Text style={styles.title}>
                  Bill #{selected.orderNumber}
                </Text>

                <Text style={styles.text}>
                  {selected.customerName || 'Walk-in'}
                  {selected.tableNumber
                    ? ` · Table ${selected.tableNumber}`
                    : ''}
                </Text>

                {items.map(item => (
                  <View
                    key={item.id}
                    style={styles.item}>
                    <Text style={styles.text}>
                      {item.productNameSnapshot} ×{' '}
                      {item.quantity}
                    </Text>

                    <Text style={styles.text}>
                      ₹{item.unitPriceSnapshot.toFixed(2)} · ₹
                      {item.itemTotal.toFixed(2)}
                    </Text>
                  </View>
                ))}

                <Text style={styles.text}>
                  Subtotal: ₹
                  {selected.subtotal.toFixed(2)}
                </Text>

                <Text style={styles.text}>
                  Discount: ₹
                  {selected.discount.toFixed(2)}
                </Text>

                <Text style={styles.title}>
                  Final: ₹
                  {selected.finalTotal.toFixed(2)}
                </Text>

                <Pressable
                  style={styles.close}
                  onPress={() => setSelected(null)}>
                  <Text style={styles.closeText}>
                    Close
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 12,
  },

  text: {
    color: '#111827',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    padding: 13,
  },

  title: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
  },

  modal: {
    backgroundColor: '#0008',
    flex: 1,
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: '#fff',
    gap: 10,
    padding: 20,
  },

  item: {
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    paddingVertical: 7,
  },

  close: {
    backgroundColor: '#1d4ed8',
    borderRadius: 6,
    padding: 11,
  },

  closeText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
});