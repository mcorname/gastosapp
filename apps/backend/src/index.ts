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

// Disable x-powered-by to prevent tech stack fingerprinting
app.disable('x-powered-by');

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middlewares
const allowedOrigins = [
  'https://backend-gold-omega-57.vercel.app',
  'http://localhost:8081',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));

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
