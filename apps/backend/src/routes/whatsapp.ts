import { Router } from 'express';
export const whatsappRouter = Router();
whatsappRouter.use((_req, res) => res.status(503).json({
  available: false,
  error: 'WhatsApp no está disponible. La vinculación y la recepción de transacciones están deshabilitadas.',
}));
