import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../navigation/types';
import type {ProductSalesRow} from '../types';
import {getProductSalesReport} from '../repositories/reportsRepository';
import {toDateRangeBounds} from '../utils/dateRange';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductSales'>;

export function ProductSalesScreen({route}: Props): React.JSX.Element {
  const {from, to} = route.params;
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [products, setProducts] = useState<ProductSalesRow[]>([]);

  const load = useCallback(async () => {
    const bounds = toDateRangeBounds(from, to);
    setProducts(
      await getProductSalesReport(bounds.from, bounds.to),
    );
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={styles.page}>
      <Text style={styles.rangeText}>
        {from === to ? from : `${from} to ${to}`}
      </Text>

      <FlatList
        horizontal
        contentContainerStyle={styles.filters}
        data={['ALL', ...Array.from(new Set(products.map(item => item.name))).sort((a, b) => a.localeCompare(b))]}
        keyExtractor={item => item}
        renderItem={({item}) => (
          <Pressable
            key={item}
            style={[styles.filter, selectedProduct === item && styles.selected]}
            onPress={() => setSelectedProduct(item)}>
            <Text style={styles.text}>{item === 'ALL' ? 'All Products' : item}</Text>
          </Pressable>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <View style={[styles.product, styles.header]}>
        <Text style={[styles.productName, styles.nameColumn]}>Product</Text>
        <Text style={styles.column}>Category</Text><Text style={styles.column}>Qty</Text><Text style={styles.column}>Unit Price</Text><Text style={styles.column}>Total</Text>
      </View>

      <FlatList
        data={selectedProduct === 'ALL' ? products : products.filter(item => item.name === selectedProduct)}
        keyExtractor={item => `${item.name}-${item.category}-${item.unitPrice}`}
        ListEmptyComponent={
          <Text style={styles.text}>No completed sales for this range.</Text>
        }
        renderItem={({item}) => (
          <View style={styles.product}>
            <Text style={[styles.productName, styles.nameColumn]}>{item.name}</Text>
            <Text style={styles.column}>{item.category}</Text><Text style={styles.column}>{item.quantity}</Text><Text style={styles.column}>₹{item.unitPrice.toFixed(2)}</Text><Text style={styles.column}>₹{item.revenue.toFixed(2)}</Text>
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
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 7,
    marginBottom: 6,
    flexDirection: 'row',
    gap: 6,
    padding: 11,
  },

  productName: {
    color: '#111827',
    fontWeight: '700',
  },
  header: {backgroundColor: '#e2e8f0'},
  nameColumn: {flex: 1.5},
  column: {color: '#111827', flex: 1, fontSize: 12},
});
