import { Router } from 'express';
export const shortcutsRouter = Router();
shortcutsRouter.use((_req, res) => res.status(503).json({
  available: false, saved: false,
  error: 'La integración con atajos y SMS no está disponible. Registra la transacción en la aplicación.',
}));
