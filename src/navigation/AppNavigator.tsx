import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {BillHistoryScreen} from '../screens/BillHistoryScreen';
import {DayEndReportScreen} from '../screens/DayEndReportScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {NewOrderScreen} from '../screens/NewOrderScreen';
import {TablesScreen} from '../screens/TablesScreen';
import {ProductsScreen} from '../screens/ProductsScreen';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {backgroundColor: '#ffffff'},
          headerTitleStyle: {fontWeight: '600'},
          headerTintColor: '#1f2937',
          contentStyle: {backgroundColor: '#f3f4f6'},
        }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{title: 'Cafe POS'}} />
        <Stack.Screen name="NewOrder" component={NewOrderScreen} options={{title: 'New Order'}} />
        <Stack.Screen name="Tables" component={TablesScreen} options={{title: 'Tables'}} />
        <Stack.Screen name="BillHistory" component={BillHistoryScreen} options={{title: 'Bill History'}} />
        <Stack.Screen name="DayEndReport" component={DayEndReportScreen} options={{title: 'Day End Report'}} />
        <Stack.Screen name="Products" component={ProductsScreen} options={{title: 'Products / Menu'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
