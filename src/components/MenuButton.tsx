import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

type MenuButtonProps = {
  label: string;
  onPress: () => void;
};

export function MenuButton({label, onPress}: MenuButtonProps): React.JSX.Element {
  return (
    <Pressable accessibilityRole="button" style={styles.button} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 96,
    padding: 16,
  },
  label: {color: '#111827', fontSize: 20, fontWeight: '600'},
});
