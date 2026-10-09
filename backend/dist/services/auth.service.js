"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const env_1 = require("../config/env");
class AuthService {
    async register(data) {
        const existing = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            const error = new Error('User already exists with this email');
            error.statusCode = 409;
            throw error;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const password_hash = await bcryptjs_1.default.hash(data.password, salt);
        const user = await prisma_1.prisma.user.create({
            data: {
                full_name: data.full_name,
                email: data.email,
                password_hash,
                id_role: data.id_role,
                id_medical_center: data.id_medical_center,
            },
            include: {
                role: true,
                medical_center: true,
            },
        });
        const token = this.generateToken(user);
        return {
            user: {
                id_user: user.id_user,
                full_name: user.full_name,
                email: user.email,
                role: user.role.role_name,
                id_medical_center: user.id_medical_center,
                medical_center_name: user.medical_center?.name || null,
            },
            token,
        };
    }
    async login(data) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
            include: {
                role: true,
                medical_center: true,
            },
        });
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }
        const isMatch = await bcryptjs_1.default.compare(data.password, user.password_hash);
        if (!isMatch) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }
        const token = this.generateToken(user);
        return {
            user: {
                id_user: user.id_user,
                full_name: user.full_name,
                email: user.email,
                role: user.role.role_name,
                id_medical_center: user.id_medical_center,
                medical_center_name: user.medical_center?.name || null,
            },
            token,
        };
    }
    async getProfile(id_user) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id_user },
            select: {
                id_user: true,
                full_name: true,
                email: true,
                id_medical_center: true,
                role: {
                    select: { id_role: true, role_name: true },
                },
                medical_center: {
                    select: { id_medical_center: true, name: true, type: true },
                },
            },
        });
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        return user;
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({
            id_user: user.id_user,
            email: user.email,
            role: user.role.role_name,
            id_medical_center: user.id_medical_center,
        }, env_1.ENV.JWT_SECRET, { expiresIn: env_1.ENV.JWT_EXPIRES_IN });
    }
}
exports.AuthService = AuthService;
