export interface PrinterService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  printReceipt(): Promise<void>;
  testPrint(): Promise<void>;
}

/** Hardware-independent placeholder used until the café selects a printer. */
export class MockPrinterService implements PrinterService {
  private connected = false;
  async connect(): Promise<void> { this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async isConnected(): Promise<boolean> { return this.connected; }
  async printReceipt(): Promise<void> { console.log('Receipt queued for mock printer.'); }
  async testPrint(): Promise<void> { console.log('Mock printer test successful.'); }
}

export const printerService = new MockPrinterService();
