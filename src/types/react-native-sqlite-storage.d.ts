declare module 'react-native-sqlite-storage' {
  const SQLite: {
    enablePromise(enabled: boolean): void;
    openDatabase(options: {name: string; location: string}): Promise<{
      executeSql(sql: string, params?: unknown[]): Promise<unknown[]>;
      transaction(
        callback: (transaction: {executeSql(sql: string, params: unknown[]): void}) => void,
        error?: (error: unknown) => void,
        success?: () => void,
      ): void;
    }>;
  };
  export default SQLite;
}
