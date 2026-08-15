import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type SetupPlaceholderProps = {title: string};

export function SetupPlaceholder({title}: SetupPlaceholderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>This section will be implemented in a later phase.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24},
  message: {color: '#4b5563', fontSize: 16, marginTop: 8, textAlign: 'center'},
  title: {color: '#111827', fontSize: 24, fontWeight: '600'},
});
