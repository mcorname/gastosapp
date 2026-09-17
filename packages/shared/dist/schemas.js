"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategorySchema = exports.CreateAccountSchema = exports.CreateTransactionSchema = exports.ExtractedTransactionSchema = exports.TransactionSourceSchema = exports.TransactionTypeSchema = exports.AccountTypeSchema = exports.CurrencyCodeSchema = void 0;
const zod_1 = require("zod");
exports.CurrencyCodeSchema = zod_1.z.string().min(3).max(5).default('USD');
exports.AccountTypeSchema = zod_1.z.enum(['cash', 'bank', 'credit_card', 'savings', 'investment']);
exports.TransactionTypeSchema = zod_1.z.enum(['expense', 'income', 'transfer']);
exports.TransactionSourceSchema = zod_1.z.enum([
    'manual',
    'ai_text',
    'ai_voice',
    'ai_receipt',
    'whatsapp',
    'sms',
    'apple_pay',
]);
exports.ExtractedTransactionSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    currency: zod_1.z.string().default('USD'),
    type: zod_1.z.enum(['expense', 'income']),
    category: zod_1.z.string(),
    suggestedNewCategory: zod_1.z.string().optional(),
    merchant: zod_1.z.string().default('Varios'),
    date: zod_1.z.string().default(() => new Date().toISOString()),
    accountName: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    confidence: zod_1.z.number().min(0).max(1).default(0.9),
});
exports.CreateTransactionSchema = zod_1.z.object({
    accountId: zod_1.z.string().uuid(),
    categoryId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive(),
    type: exports.TransactionTypeSchema,
    date: zod_1.z.string(),
    merchant: zod_1.z.string(),
    notes: zod_1.z.string().optional(),
    source: exports.TransactionSourceSchema.default('manual'),
    currency: exports.CurrencyCodeSchema,
    destinationAccountId: zod_1.z.string().uuid().optional(),
    rawInput: zod_1.z.string().optional(),
});
exports.CreateAccountSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50),
    type: exports.AccountTypeSchema,
    initialBalance: zod_1.z.number().default(0),
    currency: exports.CurrencyCodeSchema,
    color: zod_1.z.string().default('#10B981'),
    icon: zod_1.z.string().default('wallet'),
});
exports.CreateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50),
    icon: zod_1.z.string(),
    color: zod_1.z.string(),
    type: zod_1.z.enum(['expense', 'income']),
    isDefault: zod_1.z.boolean().default(false),
});
//# sourceMappingURL=schemas.js.map