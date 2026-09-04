import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../navigation/types';
import type {ProductCategory, SalesReport} from '../types';
import {getProductSalesReport} from '../repositories/reportsRepository';
import {toDateRangeBounds} from '../utils/dateRange';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductSales'>;

const categories: Array<ProductCategory | 'ALL'> = ['ALL', 'FOOD', 'BEVERAGES', 'DESSERT', 'OTHERS'];

const label = (category: ProductCategory | 'ALL') =>
  category === 'ALL' ? 'All' : category[0] + category.slice(1).toLowerCase();

export function ProductSalesScreen({route}: Props): React.JSX.Element {
  const {from, to} = route.params;
  const [filter, setFilter] = useState<ProductCategory | 'ALL'>('ALL');
  const [products, setProducts] = useState<SalesReport['products']>([]);

  const load = useCallback(async () => {
    const bounds = toDateRangeBounds(from, to);
    setProducts(
      await getProductSalesReport(bounds.from, bounds.to, filter === 'ALL' ? undefined : filter),
    );
  }, [from, to, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={styles.page}>
      <Text style={styles.rangeText}>
        {from === to ? from : `${from} to ${to}`}
      </Text>

      <View style={styles.filters}>
        {categories.map(item => (
          <Pressable
            key={item}
            style={[styles.filter, filter === item && styles.selected]}
            onPress={() => setFilter(item)}>
            <Text style={styles.text}>{label(item)}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={products}
        keyExtractor={item => item.name}
        ListEmptyComponent={
          <Text style={styles.text}>No completed sales for this range.</Text>
        }
        renderItem={({item}) => (
          <View style={styles.product}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.text}>
              Qty {item.quantity} · ₹{item.revenue.toFixed(2)}
            </Text>
          </View>
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

  text: {
    color: '#111827',
  },

  rangeText: {
    color: '#4b5563',
    fontSize: 14,
    marginBottom: 10,
  },

  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 12,
  },

  filter: {
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  selected: {
    backgroundColor: '#bfdbfe',
  },

  product: {
    backgroundColor: '#fff',
    borderRadius: 7,
    marginBottom: 6,
    padding: 11,
  },

  productName: {
    color: '#111827',
    fontWeight: '700',
  },
});
