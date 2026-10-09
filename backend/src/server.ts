import { createApp } from './app';
import { ENV } from './config/env';

const app = createApp();

const server = app.listen(ENV.PORT, () => {
  console.log(`[Nexus Sanguinis] Server running on http://localhost:${ENV.PORT}`);
  console.log(`[Nexus Sanguinis] Health check at http://localhost:${ENV.PORT}/health`);
  console.log(`[Nexus Sanguinis] API Root at http://localhost:${ENV.PORT}/api`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});