import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AuthProvider} from './src/auth/AuthContext';
import {initializeDatabase} from './src/database';
import {AppNavigator} from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  useEffect(() => {
    void initializeDatabase().catch(error => {
      // Keep the error visible during development; later phases can present recovery UI.
      console.error('Unable to initialize the local POS database.', error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
