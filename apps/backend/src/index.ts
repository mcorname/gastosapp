import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { aiRouter } from './routes/ai.js';
import { whatsappRouter } from './routes/whatsapp.js';
import { syncRouter } from './routes/sync.js';
import { shortcutsRouter } from './routes/shortcuts.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true })); // Para webhooks de Twilio

import path from 'path';

const mobileDistPath = path.resolve(process.cwd(), 'apps/mobile/dist');

// Servir archivos estáticos del frontend móvil compilado
app.use(express.static(mobileDistPath));

// Rutas de API
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-money-backend', timestamp: new Date().toISOString() });
});

app.use('/api/ai', aiRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/sync', syncRouter);
app.use('/api/shortcuts', shortcutsRouter);

// Fallback SPA para el frontend
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(mobileDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 AI Money Backend escuchando en http://localhost:${PORT}`);
});
