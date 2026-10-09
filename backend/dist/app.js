"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const createApp = () => {
    const app = (0, express_1.default)();
    // CORS middleware - enable properly before other middlewares
    app.use((0, cors_1.default)({
        origin: ['http://localhost:4200', 'http://127.0.0.1:4200', env_1.ENV.CORS_ORIGIN].filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    }));
    // Security middlewares - disable cross-origin restrictions to allow frontend fetch
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: false,
        crossOriginOpenerPolicy: false,
    }));
    // Body parsing
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Health check endpoints
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'UP',
            timestamp: new Date().toISOString(),
            service: 'Nexus Sanguinis API',
        });
    });
    app.get('/api/health', (req, res) => {
        res.status(200).json({
            status: 'UP',
            timestamp: new Date().toISOString(),
            service: 'Nexus Sanguinis API',
        });
    });
    // Mount API endpoints
    app.use('/api', routes_1.default);
    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
    });
    // Error middleware
    app.use(error_middleware_1.errorHandler);
    return app;
};
exports.createApp = createApp;
