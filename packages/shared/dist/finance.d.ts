import type { Account, Category, Transaction } from './types.js';
export interface Ledger {
    accounts: Account[];
    categories: Category[];
    transactions: Transaction[];
    budgets: unknown[];
    settings: Record<string, string>;
}
export type TransactionInput = Pick<Transaction, 'accountId' | 'categoryId' | 'amount' | 'type' | 'date' | 'merchant' | 'notes' | 'destinationAccountId'> & Partial<Pick<Transaction, 'source' | 'currency'>>;
export declare const cents: (value: number) => number;
export declare function validMoney(value: number, signed?: boolean): void;
export declare function localDate(date?: Date): string;
export declare function validateDate(value: string): string;
export declare function formatDate(value: string, long?: boolean): string;
export declare function money(value: number, currency?: string): string;
export declare function validateTransaction(data: TransactionInput, ledger: Ledger): TransactionInput;
export declare function getBalances(ledger: Ledger): Account[];
export declare function enrichedTransactions(ledger: Ledger): {
    accountName: string;
    destinationAccountName: string | undefined;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    accountId: string;
    categoryId?: string;
    amount: number;
    type: import("./types.js").TransactionType;
    date: string;
    merchant: string;
    notes?: string;
    source: import("./types.js").TransactionSource;
    currency: import("./types.js").CurrencyCode;
    destinationAccountId?: string;
    adjustmentPrevious?: number;
    adjustmentNew?: number;
    rawInput?: string;
    syncStatus?: import("./types.js").SyncStatus;
    id: string;
    createdAt: number;
    updatedAt: number;
    deletedAt?: number | null;
}[];
export interface Filters {
    query?: string;
    month?: string;
    type?: string;
    categoryId?: string;
    accountId?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
}
export declare function filterTransactions(ledger: Ledger, filters?: Filters): {
    accountName: string;
    destinationAccountName: string | undefined;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    accountId: string;
    categoryId?: string;
    amount: number;
    type: import("./types.js").TransactionType;
    date: string;
    merchant: string;
    notes?: string;
    source: import("./types.js").TransactionSource;
    currency: import("./types.js").CurrencyCode;
    destinationAccountId?: string;
    adjustmentPrevious?: number;
    adjustmentNew?: number;
    rawInput?: string;
    syncStatus?: import("./types.js").SyncStatus;
    id: string;
    createdAt: number;
    updatedAt: number;
    deletedAt?: number | null;
}[];
export declare function monthlyStats(ledger: Ledger, month: string, currency?: string): {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    topCategories: {
        id: string;
        name: string;
        icon: string;
        color: string;
        total: number;
        percentage: number;
    }[];
};
//# sourceMappingURL=finance.d.ts.map