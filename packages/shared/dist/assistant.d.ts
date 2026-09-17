/** Deterministic local assistance. Does not call an AI provider or save data. */
export interface TransactionTextOptions {
    accounts: {
        id: string;
        name: string;
        currency: string;
    }[];
    categories: {
        id: string;
        name: string;
        type: string;
    }[];
    date?: string;
    currency?: string;
}
export interface FinancialReplyContext {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    topCategories: {
        name: string;
        total: number;
    }[];
    currency?: string;
    period?: string;
}
export declare function parseMoneyInput(text: string): number;
export declare function parseTransactionText(text: string, options: TransactionTextOptions): {
    amount: number;
    type: "income" | "expense";
    merchant: string;
    date: string;
    categoryId: string | undefined;
    accountId: string | undefined;
    currency: string;
    notes: string;
    warnings: string[];
};
export declare function createFinancialReply(prompt: string, context: FinancialReplyContext): string;
//# sourceMappingURL=assistant.d.ts.map