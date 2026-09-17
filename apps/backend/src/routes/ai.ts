import { Router } from 'express';
import { z } from 'zod';
import { AIService } from '../services/aiService.js';

export const aiRouter = Router();
const currency = z.string().regex(/^[A-Z]{3}$/);
const textRequest = z.object({
  text: z.string().trim().min(1).max(5000),
  userCurrency: currency.optional(),
  userCategories: z.array(z.string().max(100)).max(500).optional(),
  userAccounts: z.array(z.string().max(100)).max(500).optional(),
  accounts: z.array(z.object({ id: z.string().min(1), name: z.string().min(1), currency })).max(500).optional(),
  categories: z.array(z.object({ id: z.string().min(1), name: z.string().min(1), type: z.enum(['income', 'expense']) })).max(500).optional(),
}).strict();
const chatRequest = z.object({
  prompt: z.string().trim().min(1).max(5000),
  financialContext: z.object({
    totalBalance: z.number().finite(), monthlyIncome: z.number().finite().nonnegative(), monthlyExpense: z.number().finite().nonnegative(),
    topCategories: z.array(z.object({ name: z.string().min(1).max(100), total: z.number().finite().nonnegative() })).max(500),
    recentTransactions: z.array(z.string()).optional(),
    currency: currency.optional(), period: z.string().max(100).optional(),
  }).strict(),
}).strict();

aiRouter.post('/extract-text', async (req, res) => {
  const parsed = textRequest.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ mode: 'local', error: 'Revisa el texto, las cuentas y las categorías enviadas.' });
  try {
    const { text, ...options } = parsed.data;
    return res.json({ success: true, mode: 'local', saved: false, transaction: await AIService.extractFromText(text, options) });
  } catch (error) {
    return res.status(400).json({ mode: 'local', error: error instanceof Error ? error.message : 'No se pudo interpretar el texto.' });
  }
});
aiRouter.post('/chat-denis', async (req, res) => {
  const parsed = chatRequest.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ mode: 'local', error: 'Envía una pregunta y un contexto financiero válido.' });
  const { prompt, financialContext } = parsed.data;
  return res.json({ success: true, mode: 'local', reply: await AIService.chatWithDenis(prompt, financialContext) });
});
aiRouter.post('/extract-receipt', (_req, res) => res.status(503).json({ available: false, error: 'La lectura de recibos no está disponible.' }));
