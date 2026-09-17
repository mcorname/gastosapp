import { createFinancialReply, parseTransactionText, type FinancialReplyContext, type TransactionTextOptions } from '@ai-money/shared';

// Yield to the UI before local analysis so progress and disabled controls render.
const yieldToUI = () => new Promise<void>(resolve => setTimeout(resolve, 180));

export async function askLocalAssistant(prompt: string, context: FinancialReplyContext) {
  await yieldToUI();
  return createFinancialReply(prompt, context);
}

export async function extractLocalTransaction(text: string, options: TransactionTextOptions) {
  await yieldToUI();
  return parseTransactionText(text, options);
}
