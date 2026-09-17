import { z } from 'zod';

export const CurrencyCodeSchema = z.string().min(3).max(5).default('USD');

export const AccountTypeSchema = z.enum(['cash', 'bank', 'credit_card', 'savings', 'investment']);

export const TransactionTypeSchema = z.enum(['expense', 'income', 'transfer']);

export const TransactionSourceSchema = z.enum([
  'manual',
  'ai_text',
  'ai_voice',
  'ai_receipt',
  'whatsapp',
  'sms',
  'apple_pay',
]);

export const ExtractedTransactionSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  type: z.enum(['expense', 'income']),
  category: z.string(),
  suggestedNewCategory: z.string().optional(),
  merchant: z.string().default('Varios'),
  date: z.string().default(() => new Date().toISOString()),
  accountName: z.string().optional(),
  notes: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.9),
});

export const CreateTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
  type: TransactionTypeSchema,
  date: z.string(),
  merchant: z.string(),
  notes: z.string().optional(),
  source: TransactionSourceSchema.default('manual'),
  currency: CurrencyCodeSchema,
  destinationAccountId: z.string().uuid().optional(),
  rawInput: z.string().optional(),
});

export const CreateAccountSchema = z.object({
  name: z.string().min(1).max(50),
  type: AccountTypeSchema,
  initialBalance: z.number().default(0),
  currency: CurrencyCodeSchema,
  color: z.string().default('#10B981'),
  icon: z.string().default('wallet'),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string(),
  color: z.string(),
  type: z.enum(['expense', 'income']),
  isDefault: z.boolean().default(false),
});
