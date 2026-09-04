import React, {useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';

import {printerService} from '../services';

export function PrinterSettingsScreen(): React.JSX.Element {
  const [busy, setBusy] = useState(false);

  const testPrint = async () => {
    setBusy(true);
    try {
      await printerService.testPrint();
      Alert.alert('Test print sent', 'The mock printer received the test print request.');
    } catch (error) {
      Alert.alert('Test print failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Printer</Text>

      <Text style={styles.text}>
        This café&apos;s tablet is from TBS Electronics and has a built-in thermal receipt printer. The
        exact printer connection method (Bluetooth, USB, or manufacturer SDK) has not been confirmed yet,
        so the app is currently using a mock printer through the existing PrinterService abstraction.
      </Text>

      <Text style={styles.text}>
        Once the connection method is confirmed, the real printer integration can be added behind
        PrinterService without changing the rest of the app.
      </Text>

      <Pressable style={styles.button} disabled={busy} onPress={() => void testPrint()}>
        <Text style={styles.buttonText}>{busy ? 'Sending…' : 'Send Test Print'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: 14,
    padding: 16,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
  text: {
    color: '#374151',
    fontSize: 15,
    lineHeight: 21,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 7,
    marginTop: 8,
    padding: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
