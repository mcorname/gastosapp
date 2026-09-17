import { Router } from 'express';
export const syncRouter = Router();
syncRouter.use((_req, res) => res.status(501).json({
  available: false,
  error: 'La sincronización remota no está implementada. Los datos permanecen en este dispositivo.',
}));
