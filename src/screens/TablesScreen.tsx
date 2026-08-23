import React, {useCallback, useEffect, useState} from 'react';
import {Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {CafeTable} from '../types';
import type {RootStackParamList} from '../navigation/types';
import {listTables} from '../repositories/tablesRepository';
import {getActiveOrderForTable, startTableOrder} from '../services';
type Props = NativeStackScreenProps<RootStackParamList, 'Tables'>;
export function TablesScreen({navigation}: Props): React.JSX.Element {
  const [tables, setTables] = useState<CafeTable[]>([]); const [customer, setCustomer] = useState('');
  const load = useCallback(async () => setTables(await listTables()), []); useEffect(() => { void load(); }, [load]);
  const select = async (table: CafeTable) => { try { if (table.status === 'OCCUPIED') { const order = await getActiveOrderForTable(table.id); if (!order) throw new Error('No active order was found for this table.'); navigation.navigate('NewOrder', {tableId: table.id, activeOrderId: order.id}); return; } const order = await startTableOrder(table.id, customer); navigation.navigate('NewOrder', {tableId: table.id, activeOrderId: order.id}); } catch (error) { Alert.alert('Cannot open table', error instanceof Error ? error.message : 'Please try again.'); await load(); } };
  return <View style={styles.page}><TextInput style={styles.input} placeholder="Customer name for the next available table (optional)" value={customer} onChangeText={setCustomer}/><Text style={styles.help}>Tap an available table to start an order. Occupied tables reopen their active order.</Text><FlatList data={tables} numColumns={2} keyExtractor={item => String(item.id)} onRefresh={() => void load()} refreshing={false} renderItem={({item}) => <Pressable style={[styles.table, item.status === 'OCCUPIED' && styles.occupied]} onPress={() => void select(item)}><Text style={styles.number}>Table {item.tableNumber}</Text><Text>{item.status === 'AVAILABLE' ? 'Available' : 'Occupied'}</Text></Pressable>}/></View>;
}
const styles = StyleSheet.create({page:{flex:1,padding:12},input:{backgroundColor:'#fff',borderColor:'#94a3b8',borderWidth:1,borderRadius:6,padding:11},help:{color:'#475569',marginVertical:10},table:{backgroundColor:'#dcfce7',borderRadius:8,flex:1,margin:5,minHeight:110,padding:16},occupied:{backgroundColor:'#fee2e2'},number:{fontSize:20,fontWeight:'700'}});
