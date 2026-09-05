export interface PrinterService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  printReceipt(receipt: ReceiptData): Promise<void>;
  testPrint(): Promise<void>;
}

export type ReceiptData = {billNumber: number; date: string; customerName: string; tableLabel: string; items: Array<{name: string; quantity: number; unitPrice: number; total: number}>; subtotal: number; discount: number; finalTotal: number};

export function formatReceipt(receipt: ReceiptData): string {
  const money = (amount: number) => `₹${amount.toFixed(2)}`;
  return ['CAFE POS', '--------------------------------', `Bill No.: ${receipt.billNumber}`, `Date: ${new Date(receipt.date).toLocaleString()}`, receipt.customerName ? `Name: ${receipt.customerName}` : '', receipt.tableLabel, '--------------------------------', 'Item                 Qty  Rate    Amt', ...receipt.items.map(item => `${item.name}\n                     ${item.quantity}  ${money(item.unitPrice)}  ${money(item.total)}`), '--------------------------------', `Subtotal ${money(receipt.subtotal)}`, `Discount ${money(receipt.discount)}`, `Total ${money(receipt.finalTotal)}`, '--------------------------------', 'Thank You & Visit Again..!!!'].filter(Boolean).join('\n');
}

/** USB transport is deliberately not guessed: it needs the TBS model, VID/PID
 * and documented command protocol or SDK before a safe implementation exists. */
export class UnconfiguredUsbPrinterService implements PrinterService {
  async connect(): Promise<void> { throw new Error('USB printer setup requires the TBS model and supported SDK or ESC/POS protocol.'); }
  async disconnect(): Promise<void> {}
  async isConnected(): Promise<boolean> { return false; }
  async printReceipt(receipt: ReceiptData): Promise<void> { console.log(formatReceipt(receipt)); throw new Error('Receipt saved, but USB printing is not configured for this TBS printer.'); }
  async testPrint(): Promise<void> { throw new Error('USB printer setup requires the TBS model and supported SDK or ESC/POS protocol.'); }
}

export const printerService = new UnconfiguredUsbPrinterService();
