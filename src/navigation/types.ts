export type RootStackParamList = {
  Login: undefined;
  AccountSetup: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  NewOrder: {tableId?: number; activeOrderId?: number} | undefined;
  Tables: undefined;
  BillHistory: undefined;
  DayEndReport: undefined;
  ProductSales: {from: string; to: string};
  Profile: undefined;
  Products: undefined;
  Printer: undefined;
};
