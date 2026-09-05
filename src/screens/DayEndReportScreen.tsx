import React, {useCallback, useEffect, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../navigation/types';
import type {SalesReport} from '../types';
import {getSalesReport} from '../repositories/reportsRepository';
import {isoDate, toDateRangeBounds as range} from '../utils/dateRange';

type Props = NativeStackScreenProps<RootStackParamList, 'DayEndReport'>;

export function DayEndReportScreen({navigation}: Props): React.JSX.Element {
  const today = isoDate(new Date());
  const yesterday = isoDate(
    new Date(Date.now() - 86400000),
  );

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [report, setReport] = useState<SalesReport | null>(
    null,
  );

  const load = useCallback(async () => {
    const dates = range(from, to);

    if (dates.to) {
      setReport(
        await getSalesReport(dates.from, dates.to),
      );
    }
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={styles.page}>
      <View style={styles.buttons}>
        <Pressable
          style={styles.button}
          onPress={() => {
            setFrom(today);
            setTo(today);
          }}>
          <Text style={styles.text}>Today</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => {
            setFrom(yesterday);
            setTo(yesterday);
          }}>
          <Text style={styles.text}>Previous day</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>
        Custom range (YYYY-MM-DD)
      </Text>

      <View style={styles.dates}>
        <TextInput
          style={styles.input}
          value={from}
          onChangeText={setFrom}
        />

        <TextInput
          style={styles.input}
          value={to}
          onChangeText={setTo}
        />

        <Pressable
          style={styles.button}
          onPress={() => void load()}>
          <Text style={styles.text}>Apply</Text>
        </Pressable>
      </View>

      {report && (
        <>
          <View style={styles.summary}>
            <Text style={styles.text}>
              Total bills: {report.billCount}
            </Text>

            <Text style={styles.text}>
              Gross sales: ₹
              {report.grossSales.toFixed(2)}
            </Text>

            <Text style={styles.text}>
              Discounts: ₹
              {report.discounts.toFixed(2)}
            </Text>

            <Text style={styles.final}>
              Final sales: ₹
              {report.finalSales.toFixed(2)}
            </Text>
          </View>

          <Pressable
            style={styles.productWiseButton}
            onPress={() =>
              navigation.navigate('ProductSales', {from, to})
            }>
            <Text style={styles.productWiseButtonText}>
              Product-wise Sales
            </Text>
          </Pressable>

        </>
      )}
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

  buttons: {
    flexDirection: 'row',
    gap: 8,
  },

  button: {
    backgroundColor: '#fff',
    borderColor: '#94a3b8',
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
  },

  hint: {
    color: '#111827',
    marginTop: 14,
  },

  dates: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  input: {
    backgroundColor: '#fff',
    borderColor: '#94a3b8',
    borderRadius: 6,
    borderWidth: 1,
    color: '#111827',
    flex: 1,
    padding: 9,
  },

  summary: {
    backgroundColor: '#fff',
    borderRadius: 8,
    gap: 6,
    marginVertical: 12,
    padding: 14,
  },

  final: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
  },

  productWiseButton: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 7,
    padding: 13,
  },

  productWiseButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
