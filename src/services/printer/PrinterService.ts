export interface PrinterService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  printReceipt(): Promise<void>;
  testPrint(): Promise<void>;
}
