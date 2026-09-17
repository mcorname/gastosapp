import { z } from 'zod';
export declare const CurrencyCodeSchema: z.ZodDefault<z.ZodString>;
export declare const AccountTypeSchema: z.ZodEnum<["cash", "bank", "credit_card", "savings", "investment"]>;
export declare const TransactionTypeSchema: z.ZodEnum<["expense", "income", "transfer"]>;
export declare const TransactionSourceSchema: z.ZodEnum<["manual", "ai_text", "ai_voice", "ai_receipt", "whatsapp", "sms", "apple_pay"]>;
export declare const ExtractedTransactionSchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    type: z.ZodEnum<["expense", "income"]>;
    category: z.ZodString;
    suggestedNewCategory: z.ZodOptional<z.ZodString>;
    merchant: z.ZodDefault<z.ZodString>;
    date: z.ZodDefault<z.ZodString>;
    accountName: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    confidence: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    type: "income" | "expense";
    amount: number;
    date: string;
    merchant: string;
    category: string;
    confidence: number;
    notes?: string | undefined;
    suggestedNewCategory?: string | undefined;
    accountName?: string | undefined;
}, {
    type: "income" | "expense";
    amount: number;
    category: string;
    currency?: string | undefined;
    date?: string | undefined;
    merchant?: string | undefined;
    notes?: string | undefined;
    suggestedNewCategory?: string | undefined;
    accountName?: string | undefined;
    confidence?: number | undefined;
}>;
export declare const CreateTransactionSchema: z.ZodObject<{
    accountId: z.ZodString;
    categoryId: z.ZodString;
    amount: z.ZodNumber;
    type: z.ZodEnum<["expense", "income", "transfer"]>;
    date: z.ZodString;
    merchant: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    source: z.ZodDefault<z.ZodEnum<["manual", "ai_text", "ai_voice", "ai_receipt", "whatsapp", "sms", "apple_pay"]>>;
    currency: z.ZodDefault<z.ZodString>;
    destinationAccountId: z.ZodOptional<z.ZodString>;
    rawInput: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    type: "income" | "expense" | "transfer";
    accountId: string;
    categoryId: string;
    amount: number;
    date: string;
    merchant: string;
    source: "manual" | "ai_text" | "ai_voice" | "ai_receipt" | "whatsapp" | "sms" | "apple_pay";
    notes?: string | undefined;
    destinationAccountId?: string | undefined;
    rawInput?: string | undefined;
}, {
    type: "income" | "expense" | "transfer";
    accountId: string;
    categoryId: string;
    amount: number;
    date: string;
    merchant: string;
    currency?: string | undefined;
    notes?: string | undefined;
    destinationAccountId?: string | undefined;
    source?: "manual" | "ai_text" | "ai_voice" | "ai_receipt" | "whatsapp" | "sms" | "apple_pay" | undefined;
    rawInput?: string | undefined;
}>;
export declare const CreateAccountSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["cash", "bank", "credit_card", "savings", "investment"]>;
    initialBalance: z.ZodDefault<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    color: z.ZodDefault<z.ZodString>;
    icon: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    name: string;
    icon: string;
    color: string;
    type: "cash" | "bank" | "credit_card" | "savings" | "investment";
    initialBalance: number;
}, {
    name: string;
    type: "cash" | "bank" | "credit_card" | "savings" | "investment";
    currency?: string | undefined;
    icon?: string | undefined;
    color?: string | undefined;
    initialBalance?: number | undefined;
}>;
export declare const CreateCategorySchema: z.ZodObject<{
    name: z.ZodString;
    icon: z.ZodString;
    color: z.ZodString;
    type: z.ZodEnum<["expense", "income"]>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    icon: string;
    color: string;
    type: "income" | "expense";
    isDefault: boolean;
}, {
    name: string;
    icon: string;
    color: string;
    type: "income" | "expense";
    isDefault?: boolean | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map