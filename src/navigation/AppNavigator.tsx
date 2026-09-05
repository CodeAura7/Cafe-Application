import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {enableScreens} from 'react-native-screens';

import {BillHistoryScreen} from '../screens/BillHistoryScreen';
import {DayEndReportScreen} from '../screens/DayEndReportScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {LoginScreen} from '../screens/LoginScreen';
import {AccountSetupScreen} from '../screens/AccountSetupScreen';
import {ForgotPasswordScreen} from '../screens/ForgotPasswordScreen';
import {NewOrderScreen} from '../screens/NewOrderScreen';
import {PrinterSettingsScreen} from '../screens/PrinterSettingsScreen';
import {ProductSalesScreen} from '../screens/ProductSalesScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {TablesScreen} from '../screens/TablesScreen';
import {ProductsScreen} from '../screens/ProductsScreen';
import {useAuth} from '../auth/AuthContext';
import type {RootStackParamList} from './types';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.JSX.Element {
  const {isAuthenticated, isReady, hasAccount} = useAuth();

  if (!isReady) return <></>;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: '#ffffff'},
          headerTitleStyle: {fontWeight: '600'},
          headerTintColor: '#1f2937',
          contentStyle: {backgroundColor: '#f3f4f6'},
        }}>
        {isAuthenticated ? (
          <Stack.Group>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{title: 'Cafe POS'}}
            />
            <Stack.Screen
              name="NewOrder"
              component={NewOrderScreen}
              options={{title: 'New Order'}}
            />
            <Stack.Screen
              name="Tables"
              component={TablesScreen}
              options={{title: 'Tables'}}
            />
            <Stack.Screen
              name="BillHistory"
              component={BillHistoryScreen}
              options={{title: 'Bill History'}}
            />
            <Stack.Screen
              name="DayEndReport"
              component={DayEndReportScreen}
              options={{title: 'Day End Report'}}
            />
            <Stack.Screen
              name="ProductSales"
              component={ProductSalesScreen}
              options={{title: 'Product-wise Sales'}}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{title: 'Profile / Settings'}}
            />
            <Stack.Screen
              name="Products"
              component={ProductsScreen}
              options={{title: 'Products / Menu'}}
            />
            <Stack.Screen
              name="Printer"
              component={PrinterSettingsScreen}
              options={{title: 'Printer'}}
            />
          </Stack.Group>
        ) : hasAccount ? <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{title: 'Reset Password'}} />
        </Stack.Group> : (
          <Stack.Screen name="AccountSetup" component={AccountSetupScreen} options={{title: 'Set up CafePOS'}} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
