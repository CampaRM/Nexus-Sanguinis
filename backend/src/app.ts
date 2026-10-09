import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // CORS middleware - enable properly before other middlewares
  app.use(
    cors({
      origin: ['http://localhost:4200', 'http://127.0.0.1:4200', ENV.CORS_ORIGIN].filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    })
  );

  // Security middlewares - disable cross-origin restrictions to allow frontend fetch
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
    })
  );

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoints
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'Nexus Sanguinis API',
    });
  });

  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'Nexus Sanguinis API',
    });
  });

  // Mount API endpoints
  app.use('/api', apiRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
  });

  // Error middleware
  app.use(errorHandler);

  return app;
};
