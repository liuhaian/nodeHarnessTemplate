import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from '@/config/env.js';
import { API_PREFIX } from '@/config/constants.js';
import { requestId } from '@/middlewares/request-id.js';
import { requestLogger } from '@/middlewares/request-logger.js';
import { errorHandler, notFoundHandler } from '@/middlewares/error-handler.js';
import { createHealthRouter } from '@/routes/health.routes.js';
import { createUserRouter } from '@/routes/user.routes.js';

export function createApp(): Express {
  const app = express();

  // Security & perf
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Observability
  app.use(requestId);
  app.use(requestLogger);

  // Rate limiting on the API surface
  app.use(
    API_PREFIX,
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: {
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests, please try again later.',
        },
      },
    }),
  );

  // Routes
  app.use('/health', createHealthRouter());
  app.use(`${API_PREFIX}/users`, createUserRouter());

  // Terminal handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
