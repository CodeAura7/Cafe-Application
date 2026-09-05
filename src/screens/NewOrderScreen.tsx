import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {CartItem, Product, ProductCategory} from '../types';
import type {RootStackParamList} from '../navigation/types';

import {listProducts} from '../repositories/productsRepository';
import {listOrderItems} from '../repositories/orderItemsRepository';
import {requireOrder} from '../repositories/ordersRepository';

import {
  completeOrder,
  cartItem,
  printerService,
  assignTable,
  saveActiveOrder,
} from '../services';
import {listTables} from '../repositories/tablesRepository';

const categories: Array<ProductCategory | 'ALL'> = [
  'ALL',
  'FOOD',
  'BEVERAGES',
  'DESSERT',
  'OTHERS',
];

type Props = NativeStackScreenProps<RootStackParamList, 'NewOrder'>;

export function NewOrderScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const [activeOrderId, setActiveOrderId] = useState(route.params?.activeOrderId);
  const [tableId, setTableId] = useState(route.params?.tableId);
  const [availableTables, setAvailableTables] = useState<Array<{id: number; tableNumber: number}>>([]);
  const [tablePickerVisible, setTablePickerVisible] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] =
    useState<ProductCategory | 'ALL'>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState('');
  const [discount, setDiscount] = useState('0');

  const load = useCallback(async () => {
    setProducts(
      await listProducts(
        true,
        filter === 'ALL' ? undefined : filter,
      ),
    );

    if (activeOrderId) {
      const [order, savedItems] = await Promise.all([
        requireOrder(activeOrderId),
        listOrderItems(activeOrderId),
      ]);

      setCustomer(order.customerName ?? '');
      setDiscount(String(order.discount));

      setCart(
        savedItems.map(item => ({
          productId: item.productId,
          name: item.productNameSnapshot,
          unitPrice: item.unitPriceSnapshot,
          category: item.categorySnapshot,
          quantity: item.quantity,
        })),
      );
    }
  }, [activeOrderId, filter]);

  useEffect(() => {
    void load().catch(error =>
      Alert.alert('Unable to load order', String(error)),
    );
  }, [load]);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + item.unitPrice * item.quantity,
        0,
      ),
    [cart],
  );

  const discountValue = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountValue);

  const add = (product: Product) =>
    setCart(old => {
      const found = old.find(
        item => item.productId === product.id,
      );

      return found
        ? old.map(item =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
          )
        : [
            ...old,
            cartItem(
              product.id,
              product.name,
              product.price,
              product.category,
            ),
          ];
    });

  const change = (id: number, amount: number) =>
    setCart(old =>
      old
        .map(item =>
          item.productId === id
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item,
        )
        .filter(item => item.quantity > 0),
    );

  const finish = async () => {
    try {
      const order = await completeOrder({
        orderId: activeOrderId,
        tableId,
        customerName: customer,
        discount: discountValue,
        cart,
      });

      try {
        await printerService.printReceipt({
          billNumber: order.orderNumber,
          date: order.updatedAt,
          customerName: order.customerName ?? '',
          tableLabel: tableId ? `Table ${tableId}` : 'Walk-in',
          items: cart.map(item => ({name: item.name, quantity: item.quantity, unitPrice: item.unitPrice, total: item.unitPrice * item.quantity})),
          subtotal: order.subtotal,
          discount: order.discount,
          finalTotal: order.finalTotal,
        });
      } catch {
        // Saved orders must remain valid even when printing is unavailable.
      }

      Alert.alert(
        'Bill completed',
        `Bill #${order.orderNumber}\nFinal total: ₹${order.finalTotal.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.popToTop(),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        'Cannot complete bill',
        error instanceof Error
          ? error.message
          : 'Please check the order.',
      );
    }
  };

  const saveDraft = async () => {
    if (!activeOrderId) return;
    try {
      await saveActiveOrder(
        activeOrderId,
        customer,
        discountValue,
        cart,
      );

      Alert.alert(
        'Order saved',
        'This active order has been saved.',
      );
    } catch (error) {
      Alert.alert(
        'Cannot save order',
        error instanceof Error
          ? error.message
          : 'Please check the order.',
      );
    }
  };

  const openTablePicker = async () => {
    if (!activeOrderId) {
      Alert.alert('Save order first', 'Save this walk-in order before assigning a table.');
      return;
    }
    const tables = await listTables();
    setAvailableTables(tables.filter(table => table.status === 'AVAILABLE'));
    setTablePickerVisible(true);
  };

  const chooseTable = async (id: number, number: number) => {
    try {
      if (!activeOrderId) return;
      await assignTable(activeOrderId, id);
      setTableId(id);
      navigation.setParams({tableId: id});
      setTablePickerVisible(false);
      Alert.alert('Table assigned', `Table ${number} is now occupied by this order.`);
    } catch (error) {
      Alert.alert('Cannot assign table', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <View style={styles.page}>
      <TextInput
        style={styles.input}
        placeholder="Customer name"
        placeholderTextColor="#64748b"
        value={customer}
        onChangeText={setCustomer}
      />

      {tableId ? (
        <Text style={styles.table}>Table order</Text>
      ) : (
        <Text style={styles.table}>Walk-in order</Text>
      )}

      <View style={styles.filters}>
        {categories.map(item => (
          <Pressable
            key={item}
            style={[
              styles.filter,
              filter === item && styles.selected,
            ]}
            onPress={() => setFilter(item)}>
            <Text style={styles.text}>
              {item === 'ALL' ? 'All' : item}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.content}>
        <FlatList
          style={styles.products}
          data={products}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => (
            <Pressable
              style={styles.product}
              onPress={() => add(item)}>
              <Text style={styles.name}>
                {item.name}
              </Text>

              <Text style={styles.text}>
                ₹{item.price.toFixed(2)}
              </Text>
            </Pressable>
          )}
        />

        <ScrollView style={styles.cart}>
          <Text style={styles.heading}>Cart</Text>

          {cart.map(item => (
            <View
              key={item.productId}
              style={styles.cartItem}>
              <View style={styles.grow}>
                <Text style={styles.name}>
                  {item.name}
                </Text>

                <Text style={styles.text}>
                  ₹{item.unitPrice.toFixed(2)} ×{' '}
                  {item.quantity}
                </Text>
              </View>

              <Pressable
                style={styles.step}
                onPress={() =>
                  change(item.productId, -1)
                }>
                <Text style={styles.text}>−</Text>
              </Pressable>

              <Pressable
                style={styles.step}
                onPress={() =>
                  change(item.productId, 1)
                }>
                <Text style={styles.text}>+</Text>
              </Pressable>
            </View>
          ))}

          <TextInput
            style={styles.input}
            value={discount}
            onChangeText={setDiscount}
            keyboardType="decimal-pad"
            placeholder="Discount Amount"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.text}>
            Subtotal: ₹{subtotal.toFixed(2)}
          </Text>

          <Text style={styles.total}>
            Final Total: ₹{total.toFixed(2)}
          </Text>

          {activeOrderId && <Pressable style={styles.save} onPress={() => void saveDraft()}><Text style={styles.text}>Save Table Order</Text></Pressable>}

          {activeOrderId && !tableId && (
            <Pressable style={styles.assign} onPress={() => void openTablePicker()}>
              <Text style={styles.assignText}>Assign Table</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.complete}
            onPress={() => void finish()}>
            <Text style={styles.completeText}>Complete Bill and Print Bill</Text>
          </Pressable>
        </ScrollView>
      </View>

      <Modal visible={tablePickerVisible} transparent animationType="slide" onRequestClose={() => setTablePickerVisible(false)}>
        <View style={styles.modal}>
          <View style={styles.sheet}>
            <Text style={styles.heading}>Assign an available table</Text>
            {availableTables.map(table => (
              <Pressable key={table.id} style={styles.tableChoice} onPress={() => void chooseTable(table.id, table.tableNumber)}>
                <Text style={styles.text}>Table {table.tableNumber}</Text>
              </Pressable>
            ))}
            {!availableTables.length && <Text style={styles.text}>No tables are available.</Text>}
            <Pressable style={styles.save} onPress={() => setTablePickerVisible(false)}><Text style={styles.text}>Cancel</Text></Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 10,
  },

  text: {
    color: '#111827',
  },

  input: {
    backgroundColor: '#fff',
    borderColor: '#94a3b8',
    borderWidth: 1,
    borderRadius: 6,
    color: '#111827',
    marginVertical: 6,
    padding: 10,
  },

  table: {
    color: '#111827',
    fontWeight: '700',
    marginVertical: 3,
  },

  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 5,
  },

  filter: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 8,
  },

  selected: {
    backgroundColor: '#bfdbfe',
  },

  content: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },

  products: {
    flex: 1,
  },

  product: {
    backgroundColor: '#fff',
    borderRadius: 7,
    marginBottom: 7,
    padding: 10,
  },

  cart: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 10,
  },

  heading: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },

  cartItem: {
    alignItems: 'center',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 8,
  },

  grow: {
    flex: 1,
  },

  name: {
    color: '#111827',
    fontWeight: '700',
  },

  step: {
    borderColor: '#94a3b8',
    borderRadius: 4,
    borderWidth: 1,
    marginLeft: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  total: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 5,
  },

  save: {
    backgroundColor: '#e2e8f0',
    borderRadius: 7,
    marginTop: 8,
    padding: 12,
  },

  assign: {backgroundColor: '#1d4ed8', borderRadius: 7, marginTop: 8, padding: 12},
  assignText: {color: '#fff', fontWeight: '700', textAlign: 'center'},
  modal: {backgroundColor: '#0008', flex: 1, justifyContent: 'flex-end'},
  sheet: {backgroundColor: '#fff', gap: 8, padding: 20},
  tableChoice: {borderColor: '#94a3b8', borderRadius: 6, borderWidth: 1, padding: 12},

  complete: {
    backgroundColor: '#15803d',
    borderRadius: 7,
    marginTop: 12,
    padding: 12,
  },

  completeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
