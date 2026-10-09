"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const app = (0, app_1.createApp)();
const server = app.listen(env_1.ENV.PORT, () => {
    console.log(`[Nexus Sanguinis] Server running on http://localhost:${env_1.ENV.PORT}`);
    console.log(`[Nexus Sanguinis] Health check at http://localhost:${env_1.ENV.PORT}/health`);
    console.log(`[Nexus Sanguinis] API Root at http://localhost:${env_1.ENV.PORT}/api`);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
