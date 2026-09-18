import { createFinancialReply, parseTransactionText, type ExtractedTransaction, type FinancialReplyContext, type TransactionTextOptions } from '@ai-money/shared';

export interface AIParseOptions {
  userCategories?: string[];
  userAccounts?: string[];
  userCurrency?: string;
  accounts?: TransactionTextOptions['accounts'];
  categories?: TransactionTextOptions['categories'];
}

export class AIService {
  static async extractFromText(text: string, options: AIParseOptions = {}) {
    // Name-only legacy input lacks durable IDs and remains unresolved for review.
    const accounts = options.accounts ?? [];
    const categories = options.categories ?? [];
    const draft = parseTransactionText(text, { accounts, categories, currency: options.userCurrency });
    return {
      ...draft,
      category: categories.find(c => c.id === draft.categoryId)?.name ?? '',
      accountName: accounts.find(a => a.id === draft.accountId)?.name,
      confidence: 0,
    } satisfies ExtractedTransaction & typeof draft;
  }
  static async extractFromReceipt(_imageBuffer: Buffer, _mimeType: string, _options?: AIParseOptions): Promise<ExtractedTransaction> {
    throw new Error('La lectura de recibos no está disponible. Ingresa los datos manualmente.');
  }
  static async chatWithDenis(prompt: string, financialContext: FinancialReplyContext): Promise<string> {
    return createFinancialReply(prompt, financialContext);
  }
}
