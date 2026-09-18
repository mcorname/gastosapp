import path from 'path';
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
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// In-memory rate limiter for /api/* (120 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 120;

// Periodic cleanup of stale rate-limit records every 5 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);
if (cleanupInterval.unref) cleanupInterval.unref();

const apiRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  record.count += 1;
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000));
    return res.status(429).json({
      error: 'Demasiadas solicitudes. Por favor espera un momento antes de reintentar.',
      retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
    });
  }

  next();
};

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

import fs from 'fs';

const candidatePaths = [
  path.resolve(process.cwd(), 'apps/mobile/dist'),
  path.resolve(process.cwd(), '../mobile/dist'),
  path.resolve(__dirname, '../../mobile/dist'),
  path.resolve(__dirname, '../../../apps/mobile/dist'),
];
const mobileDistPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0];

// Servir archivos estáticos del frontend móvil compilado
app.use(express.static(mobileDistPath));

// Rutas de API protegidas con rate limiting
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-money-backend', timestamp: new Date().toISOString() });
});

app.use('/api', apiRateLimiter);
app.use('/api/ai', aiRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/sync', syncRouter);
app.use('/api/shortcuts', shortcutsRouter);

// 404 estricto para rutas de API no existentes
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint de API no encontrado' });
});

// Fallback SPA para el frontend (rutas de navegación web)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  const indexPath = path.join(mobileDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).send('Frontend build not found. Please run npm run build first.');
});

// Manejador centralizado de errores
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error no controlado en el servidor:', err.message);
  res.status(500).json({
    error: 'Ocurrió un error interno en el servidor.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Money Backend escuchando en http://localhost:${PORT}`);
});
