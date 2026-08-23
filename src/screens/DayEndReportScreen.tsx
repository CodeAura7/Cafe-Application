import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type {SalesReport} from '../types';
import {getSalesReport} from '../repositories/reportsRepository';

const isoDate = (date: Date) =>
  date.toISOString().slice(0, 10);

const range = (from: string, to: string) => ({
  from: new Date(`${from}T00:00:00`).toISOString(),
  to: new Date(
    new Date(`${to}T00:00:00`).getTime() + 86400000,
  ).toISOString(),
});

export function DayEndReportScreen(): React.JSX.Element {
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

          <Text style={styles.heading}>
            Product-wise sales
          </Text>

          <FlatList
            data={report.products}
            keyExtractor={item => item.name}
            ListEmptyComponent={
              <Text style={styles.text}>
                No completed sales in this range.
              </Text>
            }
            renderItem={({item}) => (
              <View style={styles.product}>
                <Text style={styles.productName}>
                  {item.name}
                </Text>

                <Text style={styles.text}>
                  Qty {item.quantity} · ₹
                  {item.revenue.toFixed(2)}
                </Text>
              </View>
            )}
          />
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

  heading: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 7,
  },

  product: {
    backgroundColor: '#fff',
    borderRadius: 7,
    marginBottom: 6,
    padding: 11,
  },

  productName: {
    color: '#111827',
    fontWeight: '700',
  },
});