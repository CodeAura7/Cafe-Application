import React, {useCallback, useEffect, useState} from 'react';
import {Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {Product, ProductCategory} from '../types';
import {createProduct, listProducts, updateProduct} from '../repositories/productsRepository';

const categories: Array<ProductCategory | 'ALL'> = ['ALL', 'FOOD', 'BEVERAGES', 'DESSERT', 'OTHERS'];
const label = (category: ProductCategory | 'ALL') => category === 'ALL' ? 'All' : category[0] + category.slice(1).toLowerCase();

export function ProductsScreen(): React.JSX.Element {
  const [products, setProducts] = useState<Product[]>([]); const [filter, setFilter] = useState<ProductCategory | 'ALL'>('ALL');
  const [editing, setEditing] = useState<Product | null>(null); const [visible, setVisible] = useState(false);
  const [name, setName] = useState(''); const [price, setPrice] = useState(''); const [category, setCategory] = useState<ProductCategory>('FOOD');
  const load = useCallback(async () => setProducts(await listProducts(false, filter === 'ALL' ? undefined : filter)), [filter]);
  useEffect(() => { void load(); }, [load]);
  const open = (product?: Product) => { setEditing(product ?? null); setName(product?.name ?? ''); setPrice(product ? String(product.price) : ''); setCategory(product?.category ?? 'FOOD'); setVisible(true); };
  const save = async () => { try { const value = Number(price); if (editing) await updateProduct(editing.id, {name, price: value, category}); else await createProduct({name, price: value, category}); setVisible(false); await load(); } catch (error) { Alert.alert('Unable to save product', error instanceof Error ? error.message : 'Please check the details.'); } };
  return <View style={styles.page}><View style={styles.filters}>{categories.map(item => <Pressable key={item} style={[styles.filter, filter === item && styles.selected]} onPress={() => setFilter(item)}><Text>{label(item)}</Text></Pressable>)}</View>
    <Pressable style={styles.primary} onPress={() => open()}><Text style={styles.primaryText}>Add Product</Text></Pressable>
    <FlatList data={products} keyExtractor={item => String(item.id)} contentContainerStyle={styles.list} ListEmptyComponent={<Text>No products in this category.</Text>} renderItem={({item}) => <View style={styles.card}><View style={styles.grow}><Text style={styles.name}>{item.name}</Text><Text>{label(item.category)} · ₹{item.price.toFixed(2)} · {item.isActive ? 'Active' : 'Inactive'}</Text></View><Pressable style={styles.action} onPress={() => open(item)}><Text>Edit</Text></Pressable><Pressable style={styles.action} onPress={() => void updateProduct(item.id, {isActive: !item.isActive}).then(load)}><Text>{item.isActive ? 'Disable' : 'Enable'}</Text></Pressable></View>} />
    <Modal visible={visible} transparent animationType="slide"><View style={styles.modal}><View style={styles.sheet}><Text style={styles.title}>{editing ? 'Edit Product' : 'New Product'}</Text><TextInput style={styles.input} placeholder="Product name" value={name} onChangeText={setName}/><TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad"/>
      <View style={styles.filters}>{categories.slice(1).map(item => <Pressable key={item} style={[styles.filter, category === item && styles.selected]} onPress={() => setCategory(item as ProductCategory)}><Text>{label(item)}</Text></Pressable>)}</View><View style={styles.row}><Pressable style={styles.action} onPress={() => setVisible(false)}><Text>Cancel</Text></Pressable><Pressable style={styles.primary} onPress={() => void save()}><Text style={styles.primaryText}>Save</Text></Pressable></View></View></View></Modal>
  </View>;
}
const styles = StyleSheet.create({page:{flex:1,padding:12},filters:{flexDirection:'row',flexWrap:'wrap',gap:7,marginBottom:10},filter:{backgroundColor:'#fff',borderColor:'#cbd5e1',borderWidth:1,borderRadius:6,paddingHorizontal:10,paddingVertical:8},selected:{backgroundColor:'#bfdbfe'},primary:{alignItems:'center',backgroundColor:'#1d4ed8',borderRadius:7,padding:12},primaryText:{color:'#fff',fontWeight:'700'},list:{gap:8,paddingVertical:12},card:{alignItems:'center',backgroundColor:'#fff',borderRadius:8,flexDirection:'row',gap:7,padding:12},grow:{flex:1},name:{fontSize:16,fontWeight:'700'},action:{borderColor:'#94a3b8',borderRadius:6,borderWidth:1,padding:8},modal:{backgroundColor:'#0008',flex:1,justifyContent:'flex-end'},sheet:{backgroundColor:'#fff',gap:10,padding:20},title:{fontSize:20,fontWeight:'700'},input:{borderColor:'#94a3b8',borderWidth:1,borderRadius:6,padding:10},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}});
