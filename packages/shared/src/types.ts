export type CurrencyCode =
  | 'USD'
  | 'COP'
  | 'EUR'
  | 'MXN'
  | 'ARS'
  | 'CLP'
  | 'PEN'
  | 'BRL'
  | 'GBP'
  | string;

export type AccountType = 'cash' | 'bank' | 'credit_card' | 'savings' | 'investment';

export type TransactionType = 'expense' | 'income' | 'transfer' | 'adjustment';

export type TransactionSource =
  | 'manual'
  | 'ai_text'
  | 'ai_voice'
  | 'ai_receipt'
  | 'whatsapp'
  | 'sms'
  | 'apple_pay';

export type SyncStatus = 'synced' | 'pending_upload' | 'pending_download';

export interface BaseEntity {
  id: string; // UUID v4
  createdAt: number; // Timestamp in ms UTC
  updatedAt: number; // Timestamp in ms UTC
  deletedAt?: number | null; // Soft delete timestamp for delta sync
}

export interface Account extends BaseEntity {
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  currency: CurrencyCode;
  color: string;
  icon: string;
}

export interface Category extends BaseEntity {
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  isDefault: boolean;
}

export interface Transaction extends BaseEntity {
  accountId: string;
  categoryId?: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO 8601 string: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ
  merchant: string;
  notes?: string;
  source: TransactionSource;
  currency: CurrencyCode;
  destinationAccountId?: string; // Only for 'transfer' type
  adjustmentPrevious?: number;
  adjustmentNew?: number;
  rawInput?: string; // Original text/SMS/audio transcription
  syncStatus?: SyncStatus;
}

export interface Budget extends BaseEntity {
  categoryId: string;
  monthlyLimit: number;
  period: 'monthly';
  alertThreshold: number; // e.g. 0.8 for 80%
}

export interface SavingPocket extends BaseEntity {
  accountId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
}

export interface Debt extends BaseEntity {
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number;
  dueDate?: string;
  monthlyPayment?: number;
}

/**
 * Structured output schema for AI extraction (Text, Voice, Receipts, SMS)
 */
export interface ExtractedTransaction {
  amount: number;
  currency: CurrencyCode;
  type: 'expense' | 'income';
  category: string;
  suggestedNewCategory?: string;
  merchant: string;
  date: string; // ISO 8601 format
  accountName?: string; // Optional account hint like "Bancolombia", "Efectivo"
  notes?: string;
  confidence: number; // 0.0 to 1.0
}

/**
 * Sincronización Delta (Local-first <-> Supabase)
 */
export interface SyncPushPayload {
  lastSyncTimestamp: number;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savingPockets: SavingPocket[];
  debts: Debt[];
}

export interface SyncPullResponse {
  serverTimestamp: number;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savingPockets: SavingPocket[];
  debts: Debt[];
}
